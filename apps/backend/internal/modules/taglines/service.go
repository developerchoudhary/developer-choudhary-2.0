package taglines

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

func (s *Service) PublicList(ctx context.Context) ([]PublicDTO, error) {
	items, err := s.repo.List(ctx, true)
	if err != nil {
		return nil, err
	}
	return ToPublicList(items), nil
}

func (s *Service) Create(ctx context.Context, req *RequestDTO, actor uuid.UUID) (*ResponseDTO, error) {
	item := &Tagline{
		Text:      strings.TrimSpace(req.Text),
		Context:   req.Context,
		SortOrder: req.SortOrder,
		IsActive:  true,
	}
	if req.IsActive != nil {
		item.IsActive = *req.IsActive
	}
	item.Touch(actor)
	if err := s.repo.Create(ctx, item); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionCreate, "tagline", item.ID, req)
	s.reval.Async("site")
	return ToResponse(item), nil
}

func (s *Service) Update(ctx context.Context, id uuid.UUID, req *RequestDTO, actor uuid.UUID) (*ResponseDTO, error) {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	item.Text = strings.TrimSpace(req.Text)
	item.Context = req.Context
	item.SortOrder = req.SortOrder
	if req.IsActive != nil {
		item.IsActive = *req.IsActive
	}
	item.Touch(actor)
	if err := s.repo.Update(ctx, item); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionUpdate, "tagline", item.ID, req)
	s.reval.Async("site")
	return ToResponse(item), nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID, actor uuid.UUID) error {
	if err := s.repo.SoftDelete(ctx, id, actor); err != nil {
		return err
	}
	audit.Try(ctx, s.db, audit.ActionDelete, "tagline", id, nil)
	s.reval.Async("site")
	return nil
}

func (s *Service) Reorder(ctx context.Context, ids []uuid.UUID, actor uuid.UUID) error {
	if err := s.repo.Reorder(ctx, ids, actor); err != nil {
		return err
	}
	s.reval.Async("site")
	return nil
}
