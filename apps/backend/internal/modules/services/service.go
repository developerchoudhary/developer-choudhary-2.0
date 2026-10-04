package services

import (
	"context"
	"encoding/json"
	"strings"

	"portfolio-backend/internal/audit"
	"portfolio-backend/internal/revalidate"
	"portfolio-backend/internal/shared"
	"portfolio-backend/pkg/slug"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Svc struct {
	repo  Repository
	db    *bun.DB
	reval *revalidate.Client
}

func NewService(repo Repository, db *bun.DB, reval *revalidate.Client) *Svc {
	return &Svc{repo: repo, db: db, reval: reval}
}

func (s *Svc) List(ctx context.Context) ([]*ResponseDTO, error) {
	items, err := s.repo.List(ctx, false)
	if err != nil {
		return nil, err
	}
	return ToListResponse(items), nil
}

func (s *Svc) PublicList(ctx context.Context) ([]*ResponseDTO, error) {
	items, err := s.repo.List(ctx, true)
	if err != nil {
		return nil, err
	}
	return ToListResponse(items), nil
}

func (s *Svc) Get(ctx context.Context, id uuid.UUID) (*ResponseDTO, error) {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	return ToResponse(item), nil
}

func (s *Svc) PublicGetBySlug(ctx context.Context, sl string) (*ResponseDTO, error) {
	item, err := s.repo.GetBySlug(ctx, sl, true)
	if err != nil {
		return nil, err
	}
	return ToResponse(item), nil
}

func (s *Svc) Create(ctx context.Context, req *RequestDTO, actor uuid.UUID) (*ResponseDTO, error) {
	item := &Service{}
	if err := s.apply(ctx, item, req, actor); err != nil {
		return nil, err
	}
	item.Touch(actor)
	if err := s.repo.Create(ctx, item); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionCreate, "service", item.ID, map[string]any{"slug": item.Slug, "title": item.Title})
	s.reval.Async("services", "site", "sitemap")
	return ToResponse(item), nil
}

func (s *Svc) Update(ctx context.Context, id uuid.UUID, req *RequestDTO, actor uuid.UUID) (*ResponseDTO, error) {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if err := s.apply(ctx, item, req, actor); err != nil {
		return nil, err
	}
	item.Touch(actor)
	if err := s.repo.Update(ctx, item); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionUpdate, "service", item.ID, map[string]any{"slug": item.Slug, "title": item.Title})
	s.reval.Async("services", "site", "sitemap")
	return ToResponse(item), nil
}

func (s *Svc) Delete(ctx context.Context, id uuid.UUID, actor uuid.UUID) error {
	if err := s.repo.SoftDelete(ctx, id, actor); err != nil {
		return err
	}
	audit.Try(ctx, s.db, audit.ActionDelete, "service", id, nil)
	s.reval.Async("services", "site", "sitemap")
	return nil
}

func (s *Svc) Reorder(ctx context.Context, ids []uuid.UUID, actor uuid.UUID) error {
	if err := s.repo.Reorder(ctx, ids, actor); err != nil {
		return err
	}
	s.reval.Async("services", "site")
	return nil
}

func (s *Svc) apply(ctx context.Context, item *Service, req *RequestDTO, actor uuid.UUID) error {
	desc, _, err := shared.ValidateBlocks(req.Description)
	if err != nil {
		return err
	}
	faqs := req.FAQs
	if faqs == nil {
		faqs = []FAQ{}
	}
	faqsJSON, err := json.Marshal(faqs)
	if err != nil {
		return err
	}
	base := slug.Coalesce(req.Slug, req.Title)
	if item.Slug != base {
		unique, err := s.repo.UniqueSlug(ctx, base, item.ID)
		if err != nil {
			return err
		}
		item.Slug = unique
	}
	item.Title = strings.TrimSpace(req.Title)
	item.Tagline = strings.TrimSpace(req.Tagline)
	item.Summary = strings.TrimSpace(req.Summary)
	item.Description = desc
	item.Icon = strings.TrimSpace(req.Icon)
	if item.Icon == "" {
		item.Icon = "sparkles"
	}
	item.Deliverables = cleanList(req.Deliverables)
	item.TechStack = cleanList(req.TechStack)
	item.IdealFor = cleanList(req.IdealFor)
	item.StartingPriceLabel = strings.TrimSpace(req.StartingPriceLabel)
	item.TimelineLabel = strings.TrimSpace(req.TimelineLabel)
	item.FAQs = faqsJSON
	item.CoverFileID = req.CoverFileID
	item.CoverURL = strings.TrimSpace(req.CoverURL)
	item.SEOTitle = strings.TrimSpace(req.SEOTitle)
	item.SEODescription = strings.TrimSpace(req.SEODescription)
	item.SortOrder = req.SortOrder
	if req.IsFeatured != nil {
		item.IsFeatured = *req.IsFeatured
	}
	if req.IsPublished != nil {
		item.IsPublished = *req.IsPublished
	} else if item.ID == uuid.Nil {
		item.IsPublished = true
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
