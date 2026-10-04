package projects

import (
	"context"
	"encoding/json"
	"strings"

	"portfolio-backend/internal/audit"
	"portfolio-backend/internal/revalidate"
	"portfolio-backend/internal/shared"
	"portfolio-backend/pkg/dateparse"
	"portfolio-backend/pkg/httputil"
	"portfolio-backend/pkg/pagination"
	"portfolio-backend/pkg/slug"

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

type DetailDTO struct {
	*ResponseDTO
	Related []*ResponseDTO `json:"related"`
}

func (s *Service) List(ctx context.Context, query *pagination.ListQuery) ([]*ResponseDTO, *pagination.Response, error) {
	items, total, err := s.repo.List(ctx, query, false)
	if err != nil {
		return nil, nil, err
	}
	return ToListResponse(items), pagination.NewResponse(&query.Request, total), nil
}

func (s *Service) PublicList(ctx context.Context, query *pagination.ListQuery) ([]*ResponseDTO, *pagination.Response, error) {
	items, total, err := s.repo.List(ctx, query, true)
	if err != nil {
		return nil, nil, err
	}
	return ToListResponse(items), pagination.NewResponse(&query.Request, total), nil
}

func (s *Service) Featured(ctx context.Context, limit int) ([]*ResponseDTO, error) {
	items, err := s.repo.ListPublished(ctx, true, limit)
	if err != nil {
		return nil, err
	}
	return ToListResponse(items), nil
}

func (s *Service) PublishedModels(ctx context.Context, featuredOnly bool, limit int) ([]*Project, error) {
	return s.repo.ListPublished(ctx, featuredOnly, limit)
}

func (s *Service) Get(ctx context.Context, id uuid.UUID) (*ResponseDTO, error) {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	return ToResponse(item, true), nil
}

func (s *Service) PublicGetBySlug(ctx context.Context, sl string) (*DetailDTO, error) {
	item, err := s.repo.GetBySlug(ctx, sl, true)
	if err != nil {
		return nil, err
	}
	related, err := s.repo.Related(ctx, item.ID, item.ProjectType, 3)
	if err != nil {
		return nil, err
	}
	return &DetailDTO{ResponseDTO: ToResponse(item, true), Related: ToListResponse(related)}, nil
}

func (s *Service) Create(ctx context.Context, req *RequestDTO, actor uuid.UUID) (*ResponseDTO, error) {
	item := &Project{}
	if err := s.apply(ctx, item, req); err != nil {
		return nil, err
	}
	item.Touch(actor)
	if err := s.repo.Create(ctx, item); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionCreate, "project", item.ID, map[string]any{"slug": item.Slug, "title": item.Title})
	s.reval.Async("projects", "site", "sitemap", "resume")
	return ToResponse(item, true), nil
}

func (s *Service) Update(ctx context.Context, id uuid.UUID, req *RequestDTO, actor uuid.UUID) (*ResponseDTO, error) {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if err := s.apply(ctx, item, req); err != nil {
		return nil, err
	}
	item.Touch(actor)
	if err := s.repo.Update(ctx, item); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionUpdate, "project", item.ID, map[string]any{"slug": item.Slug, "title": item.Title})
	s.reval.Async("projects", "site", "sitemap", "resume")
	return ToResponse(item, true), nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID, actor uuid.UUID) error {
	if err := s.repo.SoftDelete(ctx, id, actor); err != nil {
		return err
	}
	audit.Try(ctx, s.db, audit.ActionDelete, "project", id, nil)
	s.reval.Async("projects", "site", "sitemap", "resume")
	return nil
}

func (s *Service) Reorder(ctx context.Context, ids []uuid.UUID, actor uuid.UUID) error {
	if err := s.repo.Reorder(ctx, ids, actor); err != nil {
		return err
	}
	s.reval.Async("projects", "site")
	return nil
}

func (s *Service) apply(ctx context.Context, item *Project, req *RequestDTO) error {
	desc, _, err := shared.ValidateBlocks(req.Description)
	if err != nil {
		return err
	}
	started, err := dateparse.ParseOptional(req.StartedAt)
	if err != nil {
		return httputil.BadRequest("startedAt: " + err.Error())
	}
	completed, err := dateparse.ParseOptional(req.CompletedAt)
	if err != nil {
		return httputil.BadRequest("completedAt: " + err.Error())
	}
	gallery := req.Gallery
	if gallery == nil {
		gallery = []GalleryItem{}
	}
	galleryJSON, err := json.Marshal(gallery)
	if err != nil {
		return err
	}
	highlights := req.Highlights
	if highlights == nil {
		highlights = []Highlight{}
	}
	highlightsJSON, err := json.Marshal(highlights)
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
	item.Subtitle = strings.TrimSpace(req.Subtitle)
	item.Summary = strings.TrimSpace(req.Summary)
	item.Description = desc
	item.ClientName = strings.TrimSpace(req.ClientName)
	item.ClientIndustry = strings.TrimSpace(req.ClientIndustry)
	item.ProjectType = req.ProjectType
	item.Status = req.Status
	if item.Status == "" {
		item.Status = StatusCompleted
	}
	item.LiveURL = strings.TrimSpace(req.LiveURL)
	item.RepoURL = strings.TrimSpace(req.RepoURL)
	item.CoverFileID = req.CoverFileID
	item.CoverURL = strings.TrimSpace(req.CoverURL)
	item.Gallery = galleryJSON
	item.Technologies = cleanList(req.Technologies)
	item.ServiceSlugs = cleanList(req.ServiceSlugs)
	item.Highlights = highlightsJSON
	item.Role = strings.TrimSpace(req.Role)
	item.StartedAt = started
	item.CompletedAt = completed
	item.SortOrder = req.SortOrder
	item.SEOTitle = strings.TrimSpace(req.SEOTitle)
	item.SEODescription = strings.TrimSpace(req.SEODescription)
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
