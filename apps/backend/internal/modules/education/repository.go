package education

import (
	"context"

	"portfolio-backend/internal/shared"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Repository interface {
	Create(ctx context.Context, item *Education) error
	Get(ctx context.Context, id uuid.UUID) (*Education, error)
	List(ctx context.Context, publishedOnly bool) ([]*Education, error)
	Update(ctx context.Context, item *Education) error
	SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error
}

type repo struct {
	db *bun.DB
}

func NewRepository(db *bun.DB) Repository {
	return &repo{db: db}
}

func (r *repo) Create(ctx context.Context, item *Education) error {
	return shared.Insert(ctx, r.db, item)
}

func (r *repo) Get(ctx context.Context, id uuid.UUID) (*Education, error) {
	return shared.FindByID[Education](ctx, r.db, id, "education not found")
}

func (r *repo) List(ctx context.Context, publishedOnly bool) ([]*Education, error) {
	var items []*Education
	q := r.db.NewSelect().Model(&items).Where("?TableAlias.deleted_at IS NULL")
	if publishedOnly {
		q = q.Where("?TableAlias.is_published = TRUE")
	}
	err := q.OrderExpr("ended_at DESC NULLS FIRST, started_at DESC, sort_order ASC").Scan(ctx)
	return items, err
}

func (r *repo) Update(ctx context.Context, item *Education) error {
	return shared.UpdateColumns(ctx, r.db, item, item.ID, "education not found",
		"institution", "degree", "field", "location", "started_at", "ended_at", "grade", "description", "sort_order", "is_published", "updated_by", "updated_at")
}

func (r *repo) SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error {
	return shared.SoftDelete[Education](ctx, r.db, id, deletedBy, "education not found")
}
