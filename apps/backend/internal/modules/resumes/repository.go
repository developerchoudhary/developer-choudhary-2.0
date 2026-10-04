package resumes

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"portfolio-backend/pkg/httputil"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Repository interface {
	Create(ctx context.Context, item *Resume, setCurrent bool) error
	Get(ctx context.Context, id uuid.UUID) (*Resume, error)
	Current(ctx context.Context) (*Resume, error)
	List(ctx context.Context) ([]*Resume, error)
	SetCurrent(ctx context.Context, id uuid.UUID) error
	Delete(ctx context.Context, id uuid.UUID) error
	IncrementDownload(ctx context.Context, id uuid.UUID) error
}

type repo struct {
	db *bun.DB
}

func NewRepository(db *bun.DB) Repository {
	return &repo{db: db}
}

func (r *repo) Create(ctx context.Context, item *Resume, setCurrent bool) error {
	return r.db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		var maxVersion int
		if err := tx.NewSelect().Model((*Resume)(nil)).ColumnExpr("COALESCE(MAX(version), 0)").Scan(ctx, &maxVersion); err != nil {
			return err
		}
		item.ID = uuid.New()
		item.Version = maxVersion + 1
		item.CreatedAt = time.Now().UTC()
		item.IsCurrent = setCurrent
		if setCurrent {
			if _, err := tx.NewUpdate().Model((*Resume)(nil)).Set("is_current = FALSE").Where("is_current = TRUE").Exec(ctx); err != nil {
				return err
			}
		}
		_, err := tx.NewInsert().Model(item).Exec(ctx)
		return err
	})
}

func (r *repo) Get(ctx context.Context, id uuid.UUID) (*Resume, error) {
	item := new(Resume)
	if err := r.db.NewSelect().Model(item).Where("?TableAlias.id = ?", id).Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, httputil.NotFound("resume not found")
		}
		return nil, err
	}
	return item, nil
}

func (r *repo) Current(ctx context.Context) (*Resume, error) {
	item := new(Resume)
	if err := r.db.NewSelect().Model(item).Where("?TableAlias.is_current = TRUE").Limit(1).Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, httputil.NotFound("no resume has been published yet")
		}
		return nil, err
	}
	return item, nil
}

func (r *repo) List(ctx context.Context) ([]*Resume, error) {
	var items []*Resume
	err := r.db.NewSelect().Model(&items).ExcludeColumn("snapshot").Order("version DESC").Limit(50).Scan(ctx)
	return items, err
}

func (r *repo) SetCurrent(ctx context.Context, id uuid.UUID) error {
	return r.db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		if _, err := tx.NewUpdate().Model((*Resume)(nil)).Set("is_current = FALSE").Where("is_current = TRUE").Exec(ctx); err != nil {
			return err
		}
		res, err := tx.NewUpdate().Model((*Resume)(nil)).Set("is_current = TRUE").Where("id = ?", id).Exec(ctx)
		if err != nil {
			return err
		}
		rows, _ := res.RowsAffected()
		if rows == 0 {
			return httputil.NotFound("resume not found")
		}
		return nil
	})
}

func (r *repo) Delete(ctx context.Context, id uuid.UUID) error {
	res, err := r.db.NewDelete().Model((*Resume)(nil)).Where("id = ?", id).Where("is_current = FALSE").Exec(ctx)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return httputil.Conflict("the current resume cannot be deleted; make another version current first")
	}
	return nil
}

func (r *repo) IncrementDownload(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.NewUpdate().Model((*Resume)(nil)).Set("download_count = download_count + 1").Where("id = ?", id).Exec(ctx)
	return err
}
