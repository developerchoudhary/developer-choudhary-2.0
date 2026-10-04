package reviews

import (
	"context"
	"strings"
	"time"

	"portfolio-backend/internal/audit"
	"portfolio-backend/internal/modules/notifications"
	"portfolio-backend/internal/revalidate"
	"portfolio-backend/pkg/dateparse"
	"portfolio-backend/pkg/httputil"
	"portfolio-backend/pkg/pagination"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Service struct {
	repo     Repository
	db       *bun.DB
	reval    *revalidate.Client
	notifier *notifications.Service
}

func NewService(repo Repository, db *bun.DB, reval *revalidate.Client, notifier *notifications.Service) *Service {
	return &Service{repo: repo, db: db, reval: reval, notifier: notifier}
}

func (s *Service) List(ctx context.Context, query *pagination.ListQuery) ([]*ResponseDTO, *pagination.Response, error) {
	items, total, err := s.repo.List(ctx, query)
	if err != nil {
		return nil, nil, err
	}
	return ToListResponse(items, true), pagination.NewResponse(&query.Request, total), nil
}

func (s *Service) PublicList(ctx context.Context, featuredOnly bool, limit int) ([]*ResponseDTO, error) {
	items, err := s.repo.ListApproved(ctx, featuredOnly, limit)
	if err != nil {
		return nil, err
	}
	return ToListResponse(items, false), nil
}

func (s *Service) Summary(ctx context.Context) (*SummaryDTO, error) {
	return s.repo.Summary(ctx)
}

func (s *Service) Get(ctx context.Context, id uuid.UUID) (*ResponseDTO, error) {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	return ToResponse(item, true), nil
}

// Submit stores a public review as pending and notifies the admin.
func (s *Service) Submit(ctx context.Context, req *SubmitRequest, ip string) (*ResponseDTO, error) {
	if strings.TrimSpace(req.Website) != "" {
		// honeypot tripped: pretend success without storing anything
		return &ResponseDTO{AuthorName: req.AuthorName, Rating: req.Rating, Body: req.Body, Status: StatusPending}, nil
	}
	item := &Review{
		AuthorName:    strings.TrimSpace(req.AuthorName),
		AuthorRole:    strings.TrimSpace(req.AuthorRole),
		AuthorCompany: strings.TrimSpace(req.AuthorCompany),
		AuthorEmail:   strings.ToLower(strings.TrimSpace(req.AuthorEmail)),
		Rating:        int16(req.Rating),
		Title:         strings.TrimSpace(req.Title),
		Body:          strings.TrimSpace(req.Body),
		ProjectID:     req.ProjectID,
		ServiceSlug:   strings.TrimSpace(req.ServiceSlug),
		Source:        "website",
		Status:        StatusPending,
		SubmittedIP:   ip,
	}
	now := time.Now().UTC()
	item.ReviewedAt = &now
	item.Touch(uuid.Nil)
	if err := s.repo.Create(audit.WithSkipAudit(ctx), item); err != nil {
		return nil, err
	}
	if s.notifier != nil {
		_ = s.notifier.ReviewReceived(ctx, notifications.ReviewPayload{
			ID:         item.ID,
			AuthorName: item.AuthorName,
			Company:    item.AuthorCompany,
			Rating:     int(item.Rating),
			Title:      item.Title,
			Body:       item.Body,
		})
	}
	return ToResponse(item, false), nil
}

func (s *Service) Create(ctx context.Context, req *AdminRequest, actor uuid.UUID) (*ResponseDTO, error) {
	item := &Review{}
	if err := apply(item, req, actor); err != nil {
		return nil, err
	}
	item.Touch(actor)
	if err := s.repo.Create(ctx, item); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionCreate, "review", item.ID, map[string]any{"author": item.AuthorName, "status": item.Status})
	s.reval.Async("reviews", "site")
	return ToResponse(item, true), nil
}

func (s *Service) Update(ctx context.Context, id uuid.UUID, req *AdminRequest, actor uuid.UUID) (*ResponseDTO, error) {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if err := apply(item, req, actor); err != nil {
		return nil, err
	}
	item.Touch(actor)
	if err := s.repo.Update(ctx, item); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionUpdate, "review", item.ID, map[string]any{"author": item.AuthorName, "status": item.Status})
	s.reval.Async("reviews", "site")
	return ToResponse(item, true), nil
}

func (s *Service) SetStatus(ctx context.Context, id uuid.UUID, req *StatusRequest, actor uuid.UUID) (*ResponseDTO, error) {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	setStatus(item, req.Status, actor)
	if req.IsFeatured != nil {
		item.IsFeatured = *req.IsFeatured && item.Status == StatusApproved
	}
	item.Touch(actor)
	if err := s.repo.Update(ctx, item); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionUpdate, "review", item.ID, map[string]any{"status": item.Status, "isFeatured": item.IsFeatured})
	s.reval.Async("reviews", "site")
	return ToResponse(item, true), nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID, actor uuid.UUID) error {
	if err := s.repo.SoftDelete(ctx, id, actor); err != nil {
		return err
	}
	audit.Try(ctx, s.db, audit.ActionDelete, "review", id, nil)
	s.reval.Async("reviews", "site")
	return nil
}

func (s *Service) CountPending(ctx context.Context) (int, error) {
	return s.repo.CountPending(ctx)
}

func apply(item *Review, req *AdminRequest, actor uuid.UUID) error {
	reviewed, err := dateparse.ParseOptional(req.ReviewedAt)
	if err != nil {
		return httputil.BadRequest("reviewedAt: " + err.Error())
	}
	item.AuthorName = strings.TrimSpace(req.AuthorName)
	item.AuthorRole = strings.TrimSpace(req.AuthorRole)
	item.AuthorCompany = strings.TrimSpace(req.AuthorCompany)
	item.AuthorEmail = strings.ToLower(strings.TrimSpace(req.AuthorEmail))
	item.AuthorWebsite = strings.TrimSpace(req.AuthorWebsite)
	item.AuthorAvatarFileID = req.AuthorAvatarFileID
	item.AuthorAvatarURL = strings.TrimSpace(req.AuthorAvatarURL)
	item.Rating = int16(req.Rating)
	item.Title = strings.TrimSpace(req.Title)
	item.Body = strings.TrimSpace(req.Body)
	item.ProjectID = req.ProjectID
	item.ServiceSlug = strings.TrimSpace(req.ServiceSlug)
	item.Source = req.Source
	item.ReviewedAt = reviewed
	if item.ReviewedAt == nil {
		now := time.Now().UTC()
		item.ReviewedAt = &now
	}
	setStatus(item, req.Status, actor)
	if req.IsFeatured != nil {
		item.IsFeatured = *req.IsFeatured && item.Status == StatusApproved
	}
	return nil
}

func setStatus(item *Review, status string, actor uuid.UUID) {
	item.Status = status
	if status == StatusApproved {
		if item.ApprovedAt == nil {
			now := time.Now().UTC()
			item.ApprovedAt = &now
		}
		item.ApprovedBy = &actor
	} else {
		item.ApprovedAt = nil
		item.ApprovedBy = nil
		item.IsFeatured = false
	}
}
