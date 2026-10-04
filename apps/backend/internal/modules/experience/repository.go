package experience

import (
	"context"

	"portfolio-backend/internal/shared"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Repository interface {
	Create(ctx context.Context, item *Experience) error
	Get(ctx context.Context, id uuid.UUID) (*Experience, error)
	List(ctx context.Context, publishedOnly bool) ([]*Experience, error)
	Update(ctx context.Context, item *Experience) error
	SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error
}

type repo struct {
	db *bun.DB
}

func NewRepository(db *bun.DB) Repository {
	return &repo{db: db}
}

func (r *repo) Create(ctx context.Context, item *Experience) error {
	return shared.Insert(ctx, r.db, item)
}

func (r *repo) Get(ctx context.Context, id uuid.UUID) (*Experience, error) {
	return shared.FindByID[Experience](ctx, r.db, id, "experience not found")
}

func (r *repo) List(ctx context.Context, publishedOnly bool) ([]*Experience, error) {
	var items []*Experience
	q := r.db.NewSelect().Model(&items).Where("?TableAlias.deleted_at IS NULL")
	if publishedOnly {
		q = q.Where("?TableAlias.is_published = TRUE")
	}
	err := q.Order("is_current DESC", "started_at DESC", "sort_order ASC").Scan(ctx)
	return items, err
}

func (r *repo) Update(ctx context.Context, item *Experience) error {
	return shared.UpdateColumns(ctx, r.db, item, item.ID, "experience not found",
		"company", "company_url", "role", "employment_type", "location", "is_remote", "started_at", "ended_at", "is_current",
		"summary", "responsibilities", "achievements", "technologies", "sort_order", "is_published",
		"updated_by", "updated_at")
}

func (r *repo) SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error {
	return shared.SoftDelete[Experience](ctx, r.db, id, deletedBy, "experience not found")
}
