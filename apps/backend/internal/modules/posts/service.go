package posts

import (
	"context"
	"log"
	"strings"
	"time"

	"portfolio-backend/internal/audit"
	"portfolio-backend/internal/revalidate"
	"portfolio-backend/internal/shared"
	"portfolio-backend/pkg/httputil"
	"portfolio-backend/pkg/pagination"
	"portfolio-backend/pkg/slug"
	"portfolio-backend/pkg/utils"

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

// ---------------- posts ----------------

func (s *Service) List(ctx context.Context, query *pagination.ListQuery) ([]*ResponseDTO, *pagination.Response, error) {
	items, total, err := s.repo.List(ctx, query, ListFilter{})
	if err != nil {
		return nil, nil, err
	}
	return ToListResponse(items), pagination.NewResponse(&query.Request, total), nil
}

func (s *Service) PublicList(ctx context.Context, query *pagination.ListQuery, categorySlug, tagSlug string) ([]*ResponseDTO, *pagination.Response, error) {
	items, total, err := s.repo.List(ctx, query, ListFilter{PublishedOnly: true, PinFeatured: query.SortBy == "", CategorySlug: categorySlug, TagSlug: tagSlug})
	if err != nil {
		return nil, nil, err
	}
	return ToListResponse(items), pagination.NewResponse(&query.Request, total), nil
}

func (s *Service) PublishedForSitemap(ctx context.Context) ([]*Post, error) {
	return s.repo.ListPublishedSlugs(ctx)
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
	related, err := s.repo.Related(ctx, item.ID, item.CategoryID, 3)
	if err != nil {
		return nil, err
	}
	return &DetailDTO{ResponseDTO: ToResponse(item, true), Related: ToListResponse(related)}, nil
}

// Preview returns any post (including drafts) by slug for the admin preview mode.
func (s *Service) Preview(ctx context.Context, sl string) (*DetailDTO, error) {
	item, err := s.repo.GetBySlug(ctx, sl, false)
	if err != nil {
		return nil, err
	}
	return &DetailDTO{ResponseDTO: ToResponse(item, true), Related: []*ResponseDTO{}}, nil
}

func (s *Service) RecordView(ctx context.Context, sl string) error {
	item, err := s.repo.GetBySlug(ctx, sl, true)
	if err != nil {
		return err
	}
	return s.repo.IncrementView(ctx, item.ID)
}

func (s *Service) Create(ctx context.Context, req *RequestDTO, actor uuid.UUID) (*ResponseDTO, error) {
	item := &Post{}
	tagIDs, err := s.apply(ctx, item, req, actor)
	if err != nil {
		return nil, err
	}
	item.Touch(actor)
	if err := s.repo.Create(ctx, item, tagIDs); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionCreate, "post", item.ID, map[string]any{"slug": item.Slug, "title": item.Title, "status": item.Status})
	s.revalidatePosts()
	return s.Get(ctx, item.ID)
}

func (s *Service) Update(ctx context.Context, id uuid.UUID, req *RequestDTO, actor uuid.UUID) (*ResponseDTO, error) {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	tagIDs, err := s.apply(ctx, item, req, actor)
	if err != nil {
		return nil, err
	}
	item.Touch(actor)
	if err := s.repo.Update(ctx, item, tagIDs); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionUpdate, "post", item.ID, map[string]any{"slug": item.Slug, "title": item.Title, "status": item.Status})
	s.revalidatePosts()
	return s.Get(ctx, item.ID)
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID, actor uuid.UUID) error {
	if err := s.repo.SoftDelete(ctx, id, actor); err != nil {
		return err
	}
	audit.Try(ctx, s.db, audit.ActionDelete, "post", id, nil)
	s.revalidatePosts()
	return nil
}

// PublishScheduled is called by the scheduler; it publishes due posts and revalidates.
func (s *Service) PublishScheduled(ctx context.Context) (int, error) {
	items, err := s.repo.PublishDue(audit.WithSkipAudit(ctx), time.Now().UTC())
	if err != nil {
		return 0, err
	}
	if len(items) > 0 {
		for _, p := range items {
			log.Printf("published scheduled post %s", p.Slug)
		}
		s.revalidatePosts()
	}
	return len(items), nil
}

func (s *Service) revalidatePosts() {
	s.reval.Async("posts", "site", "sitemap")
}

func (s *Service) apply(ctx context.Context, item *Post, req *RequestDTO, actor uuid.UUID) ([]uuid.UUID, error) {
	content, text, err := shared.ValidateBlocks(req.Content)
	if err != nil {
		return nil, err
	}

	base := slug.Coalesce(req.Slug, req.Title)
	if item.Slug != base {
		unique, err := s.repo.UniqueSlug(ctx, base, item.ID)
		if err != nil {
			return nil, err
		}
		item.Slug = unique
	}

	if req.CategoryID != nil && *req.CategoryID != uuid.Nil {
		if _, err := s.repo.GetCategory(ctx, *req.CategoryID); err != nil {
			return nil, err
		}
		item.CategoryID = req.CategoryID
	} else {
		item.CategoryID = nil
	}

	tagIDs := append([]uuid.UUID{}, req.TagIDs...)
	for _, name := range req.NewTags {
		name = strings.TrimSpace(name)
		if name == "" {
			continue
		}
		tag, err := s.ensureTag(ctx, name, actor)
		if err != nil {
			return nil, err
		}
		tagIDs = append(tagIDs, tag.ID)
	}

	now := time.Now().UTC()
	item.Title = strings.TrimSpace(req.Title)
	item.Excerpt = strings.TrimSpace(req.Excerpt)
	if item.Excerpt == "" {
		item.Excerpt = utils.Truncate(text, 180)
	}
	item.Content = content
	item.ContentText = text
	item.CoverFileID = req.CoverFileID
	item.CoverURL = strings.TrimSpace(req.CoverURL)
	item.CoverAlt = strings.TrimSpace(req.CoverAlt)
	item.ReadingTimeMinutes = utils.ReadingTimeMinutes(text)
	item.SEOTitle = strings.TrimSpace(req.SEOTitle)
	item.SEODescription = strings.TrimSpace(req.SEODescription)
	item.CanonicalURL = strings.TrimSpace(req.CanonicalURL)
	if req.IsFeatured != nil {
		item.IsFeatured = *req.IsFeatured
	}

	switch req.Status {
	case StatusPublished:
		item.Status = StatusPublished
		item.ScheduledFor = nil
		if req.PublishedAt != nil && strings.TrimSpace(*req.PublishedAt) != "" {
			t, err := time.Parse(time.RFC3339, *req.PublishedAt)
			if err != nil {
				return nil, httputil.BadRequest("publishedAt must be RFC3339")
			}
			item.PublishedAt = &t
		} else if item.PublishedAt == nil {
			item.PublishedAt = &now
		}
	case StatusScheduled:
		if req.ScheduledFor == nil || strings.TrimSpace(*req.ScheduledFor) == "" {
			return nil, httputil.BadRequest("scheduledFor is required for scheduled posts")
		}
		t, err := time.Parse(time.RFC3339, *req.ScheduledFor)
		if err != nil {
			return nil, httputil.BadRequest("scheduledFor must be RFC3339")
		}
		if !t.After(now) {
			// scheduling in the past means publish now
			item.Status = StatusPublished
			item.PublishedAt = &now
			item.ScheduledFor = nil
		} else {
			item.Status = StatusScheduled
			item.ScheduledFor = &t
			item.PublishedAt = nil
		}
	case StatusArchived:
		item.Status = StatusArchived
	default:
		item.Status = StatusDraft
		item.ScheduledFor = nil
	}
	return tagIDs, nil
}

// ---------------- categories ----------------

func (s *Service) ListCategories(ctx context.Context) ([]*CategoryDTO, error) {
	items, err := s.repo.ListCategories(ctx)
	if err != nil {
		return nil, err
	}
	return ToCategoryList(items), nil
}

func (s *Service) GetCategoryBySlug(ctx context.Context, sl string) (*CategoryDTO, error) {
	item, err := s.repo.GetCategoryBySlug(ctx, sl)
	if err != nil {
		return nil, err
	}
	return ToCategory(item), nil
}

func (s *Service) CreateCategory(ctx context.Context, req *CategoryRequest, actor uuid.UUID) (*CategoryDTO, error) {
	item := &Category{}
	if err := s.applyCategory(ctx, item, req); err != nil {
		return nil, err
	}
	item.Touch(actor)
	if err := s.repo.CreateCategory(ctx, item); err != nil {
		return nil, err
	}
	s.revalidatePosts()
	return ToCategory(item), nil
}

func (s *Service) UpdateCategory(ctx context.Context, id uuid.UUID, req *CategoryRequest, actor uuid.UUID) (*CategoryDTO, error) {
	item, err := s.repo.GetCategory(ctx, id)
	if err != nil {
		return nil, err
	}
	if err := s.applyCategory(ctx, item, req); err != nil {
		return nil, err
	}
	item.Touch(actor)
	if err := s.repo.UpdateCategory(ctx, item); err != nil {
		return nil, err
	}
	s.revalidatePosts()
	return ToCategory(item), nil
}

func (s *Service) DeleteCategory(ctx context.Context, id uuid.UUID, actor uuid.UUID) error {
	if err := s.repo.DeleteCategory(ctx, id, actor); err != nil {
		return err
	}
	s.revalidatePosts()
	return nil
}

func (s *Service) applyCategory(ctx context.Context, item *Category, req *CategoryRequest) error {
	base := slug.Coalesce(req.Slug, req.Name)
	if item.Slug != base {
		unique, err := s.repo.UniqueCategorySlug(ctx, base, item.ID)
		if err != nil {
			return err
		}
		item.Slug = unique
	}
	item.Name = strings.TrimSpace(req.Name)
	item.Description = strings.TrimSpace(req.Description)
	item.Color = strings.TrimSpace(req.Color)
	item.SortOrder = req.SortOrder
	return nil
}

// ---------------- tags ----------------

func (s *Service) ListTags(ctx context.Context) ([]TagDTO, error) {
	items, err := s.repo.ListTags(ctx)
	if err != nil {
		return nil, err
	}
	return ToTagList(items), nil
}

func (s *Service) GetTagBySlug(ctx context.Context, sl string) (*TagDTO, error) {
	item, err := s.repo.GetTagBySlug(ctx, sl)
	if err != nil {
		return nil, err
	}
	dto := ToTag(item)
	return &dto, nil
}

func (s *Service) CreateTag(ctx context.Context, req *TagRequest, actor uuid.UUID) (*TagDTO, error) {
	item, err := s.ensureTagWithSlug(ctx, req.Name, req.Slug, actor)
	if err != nil {
		return nil, err
	}
	dto := ToTag(item)
	return &dto, nil
}

func (s *Service) UpdateTag(ctx context.Context, id uuid.UUID, req *TagRequest, actor uuid.UUID) (*TagDTO, error) {
	item, err := s.repo.GetTag(ctx, id)
	if err != nil {
		return nil, err
	}
	base := slug.Coalesce(req.Slug, req.Name)
	if item.Slug != base {
		unique, err := s.repo.UniqueTagSlug(ctx, base, item.ID)
		if err != nil {
			return nil, err
		}
		item.Slug = unique
	}
	item.Name = strings.TrimSpace(req.Name)
	item.Touch(actor)
	if err := s.repo.UpdateTag(ctx, item); err != nil {
		return nil, err
	}
	s.revalidatePosts()
	dto := ToTag(item)
	return &dto, nil
}

func (s *Service) DeleteTag(ctx context.Context, id uuid.UUID, actor uuid.UUID) error {
	if err := s.repo.DeleteTag(ctx, id, actor); err != nil {
		return err
	}
	s.revalidatePosts()
	return nil
}

func (s *Service) ensureTag(ctx context.Context, name string, actor uuid.UUID) (*Tag, error) {
	return s.ensureTagWithSlug(ctx, name, "", actor)
}

func (s *Service) ensureTagWithSlug(ctx context.Context, name, explicitSlug string, actor uuid.UUID) (*Tag, error) {
	base := slug.Coalesce(explicitSlug, name)
	if existing, err := s.repo.GetTagBySlug(ctx, base); err == nil {
		return existing, nil
	}
	item := &Tag{Slug: base, Name: strings.TrimSpace(name)}
	item.Touch(actor)
	if err := s.repo.CreateTag(ctx, item); err != nil {
		return nil, err
	}
	return item, nil
}
