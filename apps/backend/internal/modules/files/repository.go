package files

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"portfolio-backend/pkg/httputil"
	"portfolio-backend/pkg/pagination"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Repository interface {
	Create(ctx context.Context, file *File) (*File, error)
	Get(ctx context.Context, id string) (*File, error)
	GetByObjectKey(ctx context.Context, objectKey string) (*File, error)
	List(ctx context.Context, query *pagination.ListQuery) ([]*File, int, error)
	Update(ctx context.Context, file *File) (*File, error)
	Delete(ctx context.Context, id string, userID uuid.UUID) (*File, error)
	Folders(ctx context.Context) ([]string, error)
}

type repo struct {
	db *bun.DB
}

func NewRepository(db *bun.DB) Repository {
	return &repo{db: db}
}

func (r *repo) Create(ctx context.Context, file *File) (*File, error) {
	_, err := r.db.NewInsert().
		Model(file).
		Column(
			"id", "filename", "content_type", "size", "visibility",
			"category", "object_key", "url", "alt_text", "width", "height", "folder", "created_by", "created_at",
		).
		Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("create file failed: %w", err)
	}
	return file, nil
}

func (r *repo) Get(ctx context.Context, id string) (*File, error) {
	file := new(File)
	err := r.db.NewSelect().
		Model(file).
		Where("?TableAlias.id = ?", id).
		Where("?TableAlias.deleted_at IS NULL").
		Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, httputil.NotFound("file not found")
		}
		return nil, fmt.Errorf("get file failed: %w", err)
	}
	return file, nil
}

func (r *repo) GetByObjectKey(ctx context.Context, objectKey string) (*File, error) {
	file := new(File)
	err := r.db.NewSelect().
		Model(file).
		Where("?TableAlias.object_key = ?", objectKey).
		Where("?TableAlias.deleted_at IS NULL").
		Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, httputil.NotFound("file not found")
		}
		return nil, fmt.Errorf("get file failed: %w", err)
	}
	return file, nil
}

func (r *repo) List(ctx context.Context, query *pagination.ListQuery) ([]*File, int, error) {
	var items []*File
	q := r.db.NewSelect().Model(&items).Where("?TableAlias.deleted_at IS NULL")
	q = query.ApplyFilters(q, ListSchema)

	count, err := q.Count(ctx)
	if err != nil {
		return nil, 0, err
	}

	q = query.ApplySort(q, ListSchema).Limit(query.Limit()).Offset(query.Offset())
	if err := q.Scan(ctx); err != nil {
		return nil, 0, err
	}
	return items, count, nil
}

func (r *repo) Update(ctx context.Context, file *File) (*File, error) {
	res, err := r.db.NewUpdate().Model(file).
		Column("alt_text", "folder").
		Where("?TableAlias.id = ?", file.ID).
		Where("?TableAlias.deleted_at IS NULL").
		Exec(ctx)
	if err != nil {
		return nil, err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return nil, httputil.NotFound("file not found")
	}
	return file, nil
}

func (r *repo) Delete(ctx context.Context, id string, userID uuid.UUID) (*File, error) {
	file, err := r.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	res, err := r.db.NewUpdate().
		Model((*File)(nil)).
		Set("deleted_at = ?", time.Now().UTC()).
		Set("deleted_by = ?", userID).
		Where("?TableAlias.id = ?", id).
		Where("?TableAlias.deleted_at IS NULL").
		Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("delete file failed: %w", err)
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("get rows affected failed: %w", err)
	}
	if rows == 0 {
		return nil, httputil.NotFound("file not found")
	}

	return file, nil
}

func (r *repo) Folders(ctx context.Context) ([]string, error) {
	var folders []string
	err := r.db.NewSelect().Model((*File)(nil)).
		ColumnExpr("DISTINCT folder").
		Where("deleted_at IS NULL").
		OrderExpr("folder ASC").
		Scan(ctx, &folders)
	return folders, err
}
