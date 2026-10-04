package settings

import (
	"context"
	"time"

	"github.com/uptrace/bun"
)

type Repository interface {
	List(ctx context.Context) ([]*Setting, error)
	Upsert(ctx context.Context, items []*Setting) error
}

type repo struct {
	db *bun.DB
}

func NewRepository(db *bun.DB) Repository {
	return &repo{db: db}
}

func (r *repo) List(ctx context.Context) ([]*Setting, error) {
	var items []*Setting
	err := r.db.NewSelect().Model(&items).Order("key ASC").Scan(ctx)
	return items, err
}

func (r *repo) Upsert(ctx context.Context, items []*Setting) error {
	if len(items) == 0 {
		return nil
	}
	return r.db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		for _, it := range items {
			it.UpdatedAt = time.Now().UTC()
			if _, err := tx.NewInsert().Model(it).
				On("CONFLICT (key) DO UPDATE").
				Set("value = EXCLUDED.value").
				Set("updated_by = EXCLUDED.updated_by").
				Set("updated_at = EXCLUDED.updated_at").
				Exec(ctx); err != nil {
				return err
			}
		}
		return nil
	})
}
