package experience

import (
	"context"
	"strings"

	"portfolio-backend/internal/audit"
	"portfolio-backend/internal/revalidate"
	"portfolio-backend/pkg/dateparse"
	"portfolio-backend/pkg/httputil"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Service struct {
	repo  Repository
	db    *bun.DB
	reval *revalidate.Client
}

func NewService(repo Repository, db *bun.DB, reval *revalidate.Client) *Service {
	return &Service{repo: repo, db: db, reval: reval}
}

func (s *Service) List(ctx context.Context) ([]*ResponseDTO, error) {
	items, err := s.repo.List(ctx, false)
	if err != nil {
		return nil, err
	}
	return ToListResponse(items), nil
}

func (s *Service) PublicList(ctx context.Context) ([]*ResponseDTO, error) {
	items, err := s.repo.List(ctx, true)
	if err != nil {
		return nil, err
	}
	return ToListResponse(items), nil
}

func (s *Service) PublishedModels(ctx context.Context) ([]*Experience, error) {
	return s.repo.List(ctx, true)
}

func (s *Service) Get(ctx context.Context, id uuid.UUID) (*ResponseDTO, error) {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	return ToResponse(item), nil
}

func (s *Service) Create(ctx context.Context, req *RequestDTO, actor uuid.UUID) (*ResponseDTO, error) {
	item := &Experience{IsPublished: true}
	if err := apply(item, req); err != nil {
		return nil, err
	}
	item.Touch(actor)
	if err := s.repo.Create(ctx, item); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionCreate, "experience", item.ID, req)
	s.reval.Async("experience", "site", "resume")
	return ToResponse(item), nil
}

func (s *Service) Update(ctx context.Context, id uuid.UUID, req *RequestDTO, actor uuid.UUID) (*ResponseDTO, error) {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if err := apply(item, req); err != nil {
		return nil, err
	}
	item.Touch(actor)
	if err := s.repo.Update(ctx, item); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionUpdate, "experience", item.ID, req)
	s.reval.Async("experience", "site", "resume")
	return ToResponse(item), nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID, actor uuid.UUID) error {
	if err := s.repo.SoftDelete(ctx, id, actor); err != nil {
		return err
	}
	audit.Try(ctx, s.db, audit.ActionDelete, "experience", id, nil)
	s.reval.Async("experience", "site", "resume")
	return nil
}

func (s *Service) Reorder(ctx context.Context, ids []uuid.UUID, actor uuid.UUID) error {
	if err := s.repo.Reorder(ctx, ids, actor); err != nil {
		return err
	}
	s.reval.Async("experience", "site")
	return nil
}

func apply(item *Experience, req *RequestDTO) error {
	started, err := dateparse.ParseDate(req.StartedAt)
	if err != nil {
		return httputil.BadRequest("startedAt: " + err.Error())
	}
	ended, err := dateparse.ParseOptional(req.EndedAt)
	if err != nil {
		return httputil.BadRequest("endedAt: " + err.Error())
	}
	if req.IsCurrent {
		ended = nil
	} else if ended == nil {
		return httputil.BadRequest("endedAt is required unless the role is current")
	}
	if ended != nil && ended.Before(*started) {
		return httputil.BadRequest("endedAt must be after startedAt")
	}
	item.Company = strings.TrimSpace(req.Company)
	item.CompanyURL = strings.TrimSpace(req.CompanyURL)
	item.Role = strings.TrimSpace(req.Role)
	item.EmploymentType = req.EmploymentType
	item.Location = strings.TrimSpace(req.Location)
	item.IsRemote = req.IsRemote
	item.StartedAt = *started
	item.EndedAt = ended
	item.IsCurrent = req.IsCurrent
	item.Summary = strings.TrimSpace(req.Summary)
	item.Responsibilities = cleanList(req.Responsibilities)
	item.Achievements = cleanList(req.Achievements)
	item.Technologies = cleanList(req.Technologies)
	item.LogoFileID = req.LogoFileID
	item.LogoURL = strings.TrimSpace(req.LogoURL)
	item.SortOrder = req.SortOrder
	if req.IsPublished != nil {
		item.IsPublished = *req.IsPublished
	}
	return nil
}

func cleanList(in []string) []string {
	out := make([]string, 0, len(in))
	for _, v := range in {
		if v = strings.TrimSpace(v); v != "" {
			out = append(out, v)
		}
	}
	return out
}
