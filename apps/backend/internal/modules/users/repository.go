package users

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"

	"portfolio-backend/pkg/httputil"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Repository interface {
	Create(ctx context.Context, u *User) (*User, error)
	Get(ctx context.Context, id uuid.UUID) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	List(ctx context.Context) ([]*User, error)
	Count(ctx context.Context) (int, error)
	Update(ctx context.Context, u *User) (*User, error)
	TouchLogin(ctx context.Context, id uuid.UUID) error
}

type repo struct {
	db *bun.DB
}

func NewRepository(db *bun.DB) Repository {
	return &repo{db: db}
}

func (r *repo) Create(ctx context.Context, u *User) (*User, error) {
	now := time.Now().UTC()
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	u.Email = strings.ToLower(strings.TrimSpace(u.Email))
	u.CreatedAt = now
	u.UpdatedAt = now
	if _, err := r.db.NewInsert().Model(u).Exec(ctx); err != nil {
		return nil, err
	}
	return u, nil
}

func (r *repo) Get(ctx context.Context, id uuid.UUID) (*User, error) {
	u := new(User)
	err := r.db.NewSelect().Model(u).Where("?TableAlias.id = ?", id).Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, httputil.NotFound("user not found")
		}
		return nil, err
	}
	return u, nil
}

func (r *repo) GetByEmail(ctx context.Context, email string) (*User, error) {
	u := new(User)
	err := r.db.NewSelect().Model(u).Where("?TableAlias.email = ?", strings.ToLower(strings.TrimSpace(email))).Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, httputil.NotFound("user not found")
		}
		return nil, err
	}
	return u, nil
}

func (r *repo) List(ctx context.Context) ([]*User, error) {
	var items []*User
	err := r.db.NewSelect().Model(&items).Order("created_at ASC").Scan(ctx)
	return items, err
}

func (r *repo) Count(ctx context.Context) (int, error) {
	return r.db.NewSelect().Model((*User)(nil)).Count(ctx)
}

func (r *repo) Update(ctx context.Context, u *User) (*User, error) {
	u.UpdatedAt = time.Now().UTC()
	res, err := r.db.NewUpdate().Model(u).
		Column("name", "role", "is_active", "password_hash", "updated_by", "updated_at").
		Where("?TableAlias.id = ?", u.ID).
		Exec(ctx)
	if err != nil {
		return nil, err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return nil, httputil.NotFound("user not found")
	}
	return u, nil
}

func (r *repo) TouchLogin(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.NewUpdate().Model((*User)(nil)).
		Set("last_login_at = ?", time.Now().UTC()).
		Where("?TableAlias.id = ?", id).
		Exec(ctx)
	return err
}
