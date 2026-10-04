package themes

import (
	"context"

	"portfolio-backend/internal/shared"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Repository interface {
	Create(ctx context.Context, item *Theme) error
	Get(ctx context.Context, id uuid.UUID) (*Theme, error)
	GetBySlug(ctx context.Context, slug string) (*Theme, error)
	List(ctx context.Context) ([]*Theme, error)
	Update(ctx context.Context, item *Theme) error
	SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error
	SlugTaken(ctx context.Context, slug string, exclude uuid.UUID) (bool, error)
}

type repo struct {
	db *bun.DB
}

func NewRepository(db *bun.DB) Repository {
	return &repo{db: db}
}

func (r *repo) Create(ctx context.Context, item *Theme) error {
	return shared.Insert(ctx, r.db, item)
}

func (r *repo) Get(ctx context.Context, id uuid.UUID) (*Theme, error) {
	return shared.FindByID[Theme](ctx, r.db, id, "theme not found")
}

func (r *repo) GetBySlug(ctx context.Context, slug string) (*Theme, error) {
	return shared.FindBySlug[Theme](ctx, r.db, slug, false, "theme not found")
}

func (r *repo) List(ctx context.Context) ([]*Theme, error) {
	var items []*Theme
	err := r.db.NewSelect().Model(&items).Where("?TableAlias.deleted_at IS NULL").Order("created_at ASC").Scan(ctx)
	return items, err
}

func (r *repo) Update(ctx context.Context, item *Theme) error {
	return shared.UpdateColumns(ctx, r.db, item, item.ID, "theme not found",
		"slug", "name", "description", "surface", "logo_from", "logo_to", "light", "dark", "updated_by", "updated_at")
}

func (r *repo) SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error {
	return shared.SoftDelete[Theme](ctx, r.db, id, deletedBy, "theme not found")
}

func (r *repo) SlugTaken(ctx context.Context, slug string, exclude uuid.UUID) (bool, error) {
	return r.db.NewSelect().Model((*Theme)(nil)).
		Where("slug = ?", slug).
		Where("deleted_at IS NULL").
		Where("id <> ?", exclude).
		Exists(ctx)
}
