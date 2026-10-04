package skills

import (
	"context"
	"strings"

	"portfolio-backend/internal/audit"
	"portfolio-backend/internal/revalidate"

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

func (s *Service) PublicGroups(ctx context.Context) ([]GroupDTO, error) {
	items, err := s.repo.List(ctx, true)
	if err != nil {
		return nil, err
	}
	return ToGroups(items), nil
}

func (s *Service) PublishedModels(ctx context.Context) ([]*Skill, error) {
	return s.repo.List(ctx, true)
}

func (s *Service) Create(ctx context.Context, req *RequestDTO, actor uuid.UUID) (*ResponseDTO, error) {
	item := &Skill{IsPublished: true}
	s.apply(item, req)
	item.Touch(actor)
	if err := s.repo.Create(ctx, item); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionCreate, "skill", item.ID, req)
	s.reval.Async("skills", "site", "resume")
	return ToResponse(item), nil
}

func (s *Service) Update(ctx context.Context, id uuid.UUID, req *RequestDTO, actor uuid.UUID) (*ResponseDTO, error) {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	s.apply(item, req)
	item.Touch(actor)
	if err := s.repo.Update(ctx, item); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionUpdate, "skill", item.ID, req)
	s.reval.Async("skills", "site", "resume")
	return ToResponse(item), nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID, actor uuid.UUID) error {
	if err := s.repo.SoftDelete(ctx, id, actor); err != nil {
		return err
	}
	audit.Try(ctx, s.db, audit.ActionDelete, "skill", id, nil)
	s.reval.Async("skills", "site", "resume")
	return nil
}

func (s *Service) apply(item *Skill, req *RequestDTO) {
	item.Name = strings.TrimSpace(req.Name)
	item.Category = req.Category
	item.SortOrder = req.SortOrder
	if req.IsFeatured != nil {
		item.IsFeatured = *req.IsFeatured
	}
	if req.IsPublished != nil {
		item.IsPublished = *req.IsPublished
	}
}
