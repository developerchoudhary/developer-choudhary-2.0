package shared

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"portfolio-backend/pkg/httputil"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

// Generic helpers for the common soft-delete CRUD shape shared by catalog modules.
// Each module still owns its Repository interface; these keep the implementations short.

func Insert[T any](ctx context.Context, db bun.IDB, item *T) error {
	if _, err := db.NewInsert().Model(item).Exec(ctx); err != nil {
		return fmt.Errorf("insert %T: %w", item, err)
	}
	return nil
}

func FindByID[T any](ctx context.Context, db bun.IDB, id uuid.UUID, notFound string) (*T, error) {
	item := new(T)
	err := db.NewSelect().Model(item).
		Where("?TableAlias.id = ?", id).
		Where("?TableAlias.deleted_at IS NULL").
		Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, httputil.NotFound(notFound)
		}
		return nil, err
	}
	return item, nil
}

func FindBySlug[T any](ctx context.Context, db bun.IDB, slug string, publishedOnly bool, notFound string) (*T, error) {
	item := new(T)
	q := db.NewSelect().Model(item).
		Where("?TableAlias.slug = ?", slug).
		Where("?TableAlias.deleted_at IS NULL")
	if publishedOnly {
		q = q.Where("?TableAlias.is_published = TRUE")
	}
	if err := q.Scan(ctx); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, httputil.NotFound(notFound)
		}
		return nil, err
	}
	return item, nil
}

func UpdateColumns[T any](ctx context.Context, db bun.IDB, item *T, id uuid.UUID, notFound string, columns ...string) error {
	res, err := db.NewUpdate().Model(item).
		Column(columns...).
		Where("?TableAlias.id = ?", id).
		Where("?TableAlias.deleted_at IS NULL").
		Exec(ctx)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return httputil.NotFound(notFound)
	}
	return nil
}

func SoftDelete[T any](ctx context.Context, db bun.IDB, id uuid.UUID, deletedBy uuid.UUID, notFound string) error {
	now := time.Now().UTC()
	res, err := db.NewUpdate().
		Model((*T)(nil)).
		Set("deleted_at = ?", now).
		Set("deleted_by = ?", deletedBy).
		Set("updated_at = ?", now).
		Set("updated_by = ?", deletedBy).
		Where("?TableAlias.id = ?", id).
		Where("?TableAlias.deleted_at IS NULL").
		Exec(ctx)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return httputil.NotFound(notFound)
	}
	return nil
}

// SlugExists reports whether another active row already uses the slug.
func SlugExists[T any](ctx context.Context, db bun.IDB, slug string, excludeID uuid.UUID) (bool, error) {
	q := db.NewSelect().Model((*T)(nil)).
		Where("?TableAlias.slug = ?", slug).
		Where("?TableAlias.deleted_at IS NULL")
	if excludeID != uuid.Nil {
		q = q.Where("?TableAlias.id <> ?", excludeID)
	}
	return q.Exists(ctx)
}

// UniqueSlug appends -2, -3 ... until the slug is free.
func UniqueSlug[T any](ctx context.Context, db bun.IDB, base string, excludeID uuid.UUID) (string, error) {
	if base == "" {
		base = "item"
	}
	candidate := base
	for i := 2; i < 1000; i++ {
		exists, err := SlugExists[T](ctx, db, candidate, excludeID)
		if err != nil {
			return "", err
		}
		if !exists {
			return candidate, nil
		}
		candidate = fmt.Sprintf("%s-%d", base, i)
	}
	return "", httputil.Conflict("could not allocate a unique slug")
}
