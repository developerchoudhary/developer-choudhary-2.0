package projects

import (
	"context"

	"portfolio-backend/internal/shared"
	"portfolio-backend/pkg/pagination"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Repository interface {
	Create(ctx context.Context, item *Project) error
	Get(ctx context.Context, id uuid.UUID) (*Project, error)
	GetBySlug(ctx context.Context, slug string, publishedOnly bool) (*Project, error)
	List(ctx context.Context, query *pagination.ListQuery, publishedOnly bool) ([]*Project, int, error)
	ListPublished(ctx context.Context, featuredOnly bool, limit int) ([]*Project, error)
	Related(ctx context.Context, exclude uuid.UUID, projectType string, limit int) ([]*Project, error)
	Update(ctx context.Context, item *Project) error
	SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error
	UniqueSlug(ctx context.Context, base string, excludeID uuid.UUID) (string, error)
	Reorder(ctx context.Context, ids []uuid.UUID, userID uuid.UUID) error
}

type repo struct {
	db *bun.DB
}

func NewRepository(db *bun.DB) Repository {
	return &repo{db: db}
}

func (r *repo) Create(ctx context.Context, item *Project) error {
	return shared.Insert(ctx, r.db, item)
}

func (r *repo) Get(ctx context.Context, id uuid.UUID) (*Project, error) {
	return shared.FindByID[Project](ctx, r.db, id, "project not found")
}

func (r *repo) GetBySlug(ctx context.Context, slug string, publishedOnly bool) (*Project, error) {
	return shared.FindBySlug[Project](ctx, r.db, slug, publishedOnly, "project not found")
}

func (r *repo) List(ctx context.Context, query *pagination.ListQuery, publishedOnly bool) ([]*Project, int, error) {
	var items []*Project
	q := r.db.NewSelect().Model(&items).Where("?TableAlias.deleted_at IS NULL")
	if publishedOnly {
		q = q.Where("?TableAlias.is_published = TRUE")
	}
	q = query.ApplyFilters(q, ListSchema)

	count, err := q.Count(ctx)
	if err != nil {
		return nil, 0, err
	}
	q = query.ApplySort(q, ListSchema).OrderExpr("projects.completed_at DESC NULLS LAST").Limit(query.Limit()).Offset(query.Offset())
	if err := q.Scan(ctx); err != nil {
		return nil, 0, err
	}
	return items, count, nil
}

func (r *repo) ListPublished(ctx context.Context, featuredOnly bool, limit int) ([]*Project, error) {
	var items []*Project
	q := r.db.NewSelect().Model(&items).
		Where("?TableAlias.deleted_at IS NULL").
		Where("?TableAlias.is_published = TRUE")
	if featuredOnly {
		q = q.Where("?TableAlias.is_featured = TRUE")
	}
	q = q.OrderExpr("sort_order ASC, completed_at DESC NULLS LAST, created_at DESC")
	if limit > 0 {
		q = q.Limit(limit)
	}
	err := q.Scan(ctx)
	return items, err
}

func (r *repo) Related(ctx context.Context, exclude uuid.UUID, projectType string, limit int) ([]*Project, error) {
	var items []*Project
	err := r.db.NewSelect().Model(&items).
		Where("?TableAlias.deleted_at IS NULL").
		Where("?TableAlias.is_published = TRUE").
		Where("?TableAlias.id <> ?", exclude).
		OrderExpr("(project_type = ?) DESC, is_featured DESC, sort_order ASC, completed_at DESC NULLS LAST", projectType).
		Limit(limit).
		Scan(ctx)
	return items, err
}

func (r *repo) Update(ctx context.Context, item *Project) error {
	return shared.UpdateColumns(ctx, r.db, item, item.ID, "project not found",
		"slug", "title", "subtitle", "summary", "description", "client_name", "client_industry", "project_type",
		"live_url", "repo_url", "cover_file_id", "cover_url", "gallery", "technologies", "service_slugs", "highlights",
		"role", "started_at", "completed_at", "is_featured", "is_published", "sort_order", "seo_title", "seo_description",
		"updated_by", "updated_at")
}

func (r *repo) SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error {
	return shared.SoftDelete[Project](ctx, r.db, id, deletedBy, "project not found")
}

func (r *repo) UniqueSlug(ctx context.Context, base string, excludeID uuid.UUID) (string, error) {
	return shared.UniqueSlug[Project](ctx, r.db, base, excludeID)
}

func (r *repo) Reorder(ctx context.Context, ids []uuid.UUID, userID uuid.UUID) error {
	return shared.Reorder[Project](ctx, r.db, ids, userID)
}
