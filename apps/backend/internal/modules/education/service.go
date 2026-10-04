package education

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

func (s *Service) PublishedModels(ctx context.Context) ([]*Education, error) {
	return s.repo.List(ctx, true)
}

func (s *Service) Create(ctx context.Context, req *RequestDTO, actor uuid.UUID) (*ResponseDTO, error) {
	item := &Education{IsPublished: true}
	if err := apply(item, req); err != nil {
		return nil, err
	}
	item.Touch(actor)
	if err := s.repo.Create(ctx, item); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionCreate, "education", item.ID, req)
	s.reval.Async("education", "site", "resume")
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
	audit.Try(ctx, s.db, audit.ActionUpdate, "education", item.ID, req)
	s.reval.Async("education", "site", "resume")
	return ToResponse(item), nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID, actor uuid.UUID) error {
	if err := s.repo.SoftDelete(ctx, id, actor); err != nil {
		return err
	}
	audit.Try(ctx, s.db, audit.ActionDelete, "education", id, nil)
	s.reval.Async("education", "site", "resume")
	return nil
}

func apply(item *Education, req *RequestDTO) error {
	started, err := dateparse.ParseOptional(req.StartedAt)
	if err != nil {
		return httputil.BadRequest("startedAt: " + err.Error())
	}
	ended, err := dateparse.ParseOptional(req.EndedAt)
	if err != nil {
		return httputil.BadRequest("endedAt: " + err.Error())
	}
	item.Institution = strings.TrimSpace(req.Institution)
	item.Degree = strings.TrimSpace(req.Degree)
	item.Field = strings.TrimSpace(req.Field)
	item.Location = strings.TrimSpace(req.Location)
	item.StartedAt = started
	item.EndedAt = ended
	item.Grade = strings.TrimSpace(req.Grade)
	item.Description = strings.TrimSpace(req.Description)
	item.SortOrder = req.SortOrder
	if req.IsPublished != nil {
		item.IsPublished = *req.IsPublished
	}
	return nil
}
