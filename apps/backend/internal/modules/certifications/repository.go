package certifications

import (
	"context"

	"portfolio-backend/internal/shared"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Repository interface {
	Create(ctx context.Context, item *Certification) error
	Get(ctx context.Context, id uuid.UUID) (*Certification, error)
	List(ctx context.Context, publishedOnly bool) ([]*Certification, error)
	Update(ctx context.Context, item *Certification) error
	SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error
}

type repo struct {
	db *bun.DB
}

func NewRepository(db *bun.DB) Repository {
	return &repo{db: db}
}

func (r *repo) Create(ctx context.Context, item *Certification) error {
	return shared.Insert(ctx, r.db, item)
}

func (r *repo) Get(ctx context.Context, id uuid.UUID) (*Certification, error) {
	return shared.FindByID[Certification](ctx, r.db, id, "certification not found")
}

func (r *repo) List(ctx context.Context, publishedOnly bool) ([]*Certification, error) {
	var items []*Certification
	q := r.db.NewSelect().Model(&items).Where("?TableAlias.deleted_at IS NULL")
	if publishedOnly {
		q = q.Where("?TableAlias.is_published = TRUE")
	}
	err := q.OrderExpr("issued_at DESC NULLS LAST, sort_order ASC").Scan(ctx)
	return items, err
}

func (r *repo) Update(ctx context.Context, item *Certification) error {
	return shared.UpdateColumns(ctx, r.db, item, item.ID, "certification not found",
		"name", "issuer", "issued_at", "expires_at", "credential_id", "credential_url", "sort_order", "is_published", "updated_by", "updated_at")
}

func (r *repo) SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error {
	return shared.SoftDelete[Certification](ctx, r.db, id, deletedBy, "certification not found")
}
