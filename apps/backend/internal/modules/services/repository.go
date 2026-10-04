package services

import (
	"context"

	"portfolio-backend/internal/shared"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Repository interface {
	Create(ctx context.Context, item *Service) error
	Get(ctx context.Context, id uuid.UUID) (*Service, error)
	GetBySlug(ctx context.Context, slug string, publishedOnly bool) (*Service, error)
	List(ctx context.Context, publishedOnly bool) ([]*Service, error)
	Update(ctx context.Context, item *Service) error
	SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error
	UniqueSlug(ctx context.Context, base string, excludeID uuid.UUID) (string, error)
}

type repo struct {
	db *bun.DB
}

func NewRepository(db *bun.DB) Repository {
	return &repo{db: db}
}

func (r *repo) Create(ctx context.Context, item *Service) error {
	return shared.Insert(ctx, r.db, item)
}

func (r *repo) Get(ctx context.Context, id uuid.UUID) (*Service, error) {
	return shared.FindByID[Service](ctx, r.db, id, "service not found")
}

func (r *repo) GetBySlug(ctx context.Context, slug string, publishedOnly bool) (*Service, error) {
	return shared.FindBySlug[Service](ctx, r.db, slug, publishedOnly, "service not found")
}

func (r *repo) List(ctx context.Context, publishedOnly bool) ([]*Service, error) {
	var items []*Service
	q := r.db.NewSelect().Model(&items).Where("?TableAlias.deleted_at IS NULL")
	if publishedOnly {
		q = q.Where("?TableAlias.is_published = TRUE")
	}
	err := q.Order("sort_order ASC", "created_at ASC").Scan(ctx)
	return items, err
}

func (r *repo) Update(ctx context.Context, item *Service) error {
	return shared.UpdateColumns(ctx, r.db, item, item.ID, "service not found",
		"slug", "title", "tagline", "summary", "description", "icon", "deliverables", "tech_stack", "ideal_for",
		"starting_price_label", "timeline_label", "faqs", "cover_file_id", "cover_url", "seo_title", "seo_description",
		"sort_order", "is_featured", "is_published", "updated_by", "updated_at")
}

func (r *repo) SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error {
	return shared.SoftDelete[Service](ctx, r.db, id, deletedBy, "service not found")
}

func (r *repo) UniqueSlug(ctx context.Context, base string, excludeID uuid.UUID) (string, error) {
	return shared.UniqueSlug[Service](ctx, r.db, base, excludeID)
}
