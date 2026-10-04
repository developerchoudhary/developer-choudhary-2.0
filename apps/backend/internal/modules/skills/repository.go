package skills

import (
	"context"

	"portfolio-backend/internal/shared"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Repository interface {
	Create(ctx context.Context, item *Skill) error
	Get(ctx context.Context, id uuid.UUID) (*Skill, error)
	List(ctx context.Context, publishedOnly bool) ([]*Skill, error)
	Update(ctx context.Context, item *Skill) error
	SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error
	Reorder(ctx context.Context, ids []uuid.UUID, userID uuid.UUID) error
}

type repo struct {
	db *bun.DB
}

func NewRepository(db *bun.DB) Repository {
	return &repo{db: db}
}

func (r *repo) Create(ctx context.Context, item *Skill) error {
	return shared.Insert(ctx, r.db, item)
}

func (r *repo) Get(ctx context.Context, id uuid.UUID) (*Skill, error) {
	return shared.FindByID[Skill](ctx, r.db, id, "skill not found")
}

func (r *repo) List(ctx context.Context, publishedOnly bool) ([]*Skill, error) {
	var items []*Skill
	q := r.db.NewSelect().Model(&items).Where("?TableAlias.deleted_at IS NULL")
	if publishedOnly {
		q = q.Where("?TableAlias.is_published = TRUE")
	}
	err := q.Order("category ASC", "sort_order ASC", "proficiency DESC", "name ASC").Scan(ctx)
	return items, err
}

func (r *repo) Update(ctx context.Context, item *Skill) error {
	return shared.UpdateColumns(ctx, r.db, item, item.ID, "skill not found",
		"name", "category", "proficiency", "years", "icon", "color", "description", "is_featured", "is_published", "sort_order", "updated_by", "updated_at")
}

func (r *repo) SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error {
	return shared.SoftDelete[Skill](ctx, r.db, id, deletedBy, "skill not found")
}

func (r *repo) Reorder(ctx context.Context, ids []uuid.UUID, userID uuid.UUID) error {
	return shared.Reorder[Skill](ctx, r.db, ids, userID)
}
