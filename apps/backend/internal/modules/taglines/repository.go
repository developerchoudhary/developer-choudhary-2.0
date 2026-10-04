package taglines

import (
	"context"

	"portfolio-backend/internal/shared"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Repository interface {
	Create(ctx context.Context, item *Tagline) error
	Get(ctx context.Context, id uuid.UUID) (*Tagline, error)
	List(ctx context.Context, activeOnly bool) ([]*Tagline, error)
	Update(ctx context.Context, item *Tagline) error
	SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error
	Reorder(ctx context.Context, ids []uuid.UUID, userID uuid.UUID) error
}

type repo struct {
	db *bun.DB
}

func NewRepository(db *bun.DB) Repository {
	return &repo{db: db}
}

func (r *repo) Create(ctx context.Context, item *Tagline) error {
	return shared.Insert(ctx, r.db, item)
}

func (r *repo) Get(ctx context.Context, id uuid.UUID) (*Tagline, error) {
	return shared.FindByID[Tagline](ctx, r.db, id, "tagline not found")
}

func (r *repo) List(ctx context.Context, activeOnly bool) ([]*Tagline, error) {
	var items []*Tagline
	q := r.db.NewSelect().Model(&items).Where("?TableAlias.deleted_at IS NULL")
	if activeOnly {
		q = q.Where("?TableAlias.is_active = TRUE")
	}
	err := q.Order("context ASC", "sort_order ASC", "created_at ASC").Scan(ctx)
	return items, err
}

func (r *repo) Update(ctx context.Context, item *Tagline) error {
	return shared.UpdateColumns(ctx, r.db, item, item.ID, "tagline not found", "text", "context", "sort_order", "is_active", "updated_by", "updated_at")
}

func (r *repo) SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error {
	return shared.SoftDelete[Tagline](ctx, r.db, id, deletedBy, "tagline not found")
}

func (r *repo) Reorder(ctx context.Context, ids []uuid.UUID, userID uuid.UUID) error {
	return shared.Reorder[Tagline](ctx, r.db, ids, userID)
}
