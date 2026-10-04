package auth

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"portfolio-backend/pkg/httputil"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type SessionRepository interface {
	Create(ctx context.Context, s *Session) error
	GetByTokenHash(ctx context.Context, hash string) (*Session, error)
	Rotate(ctx context.Context, id uuid.UUID, newHash string, expiresAt time.Time) error
	Revoke(ctx context.Context, id uuid.UUID) error
	RevokeAllForUser(ctx context.Context, userID uuid.UUID) error
	DeleteExpired(ctx context.Context) (int64, error)
}

type sessionRepo struct {
	db *bun.DB
}

func NewSessionRepository(db *bun.DB) SessionRepository {
	return &sessionRepo{db: db}
}

func (r *sessionRepo) Create(ctx context.Context, s *Session) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	s.CreatedAt = time.Now().UTC()
	_, err := r.db.NewInsert().Model(s).Exec(ctx)
	return err
}

func (r *sessionRepo) GetByTokenHash(ctx context.Context, hash string) (*Session, error) {
	s := new(Session)
	err := r.db.NewSelect().Model(s).
		Where("?TableAlias.refresh_token_hash = ?", hash).
		Where("?TableAlias.revoked_at IS NULL").
		Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, httputil.Unauthorized("Invalid or expired session")
		}
		return nil, err
	}
	return s, nil
}

func (r *sessionRepo) Rotate(ctx context.Context, id uuid.UUID, newHash string, expiresAt time.Time) error {
	now := time.Now().UTC()
	_, err := r.db.NewUpdate().Model((*Session)(nil)).
		Set("refresh_token_hash = ?", newHash).
		Set("expires_at = ?", expiresAt).
		Set("last_used_at = ?", now).
		Where("?TableAlias.id = ?", id).
		Exec(ctx)
	return err
}

func (r *sessionRepo) Revoke(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.NewUpdate().Model((*Session)(nil)).
		Set("revoked_at = ?", time.Now().UTC()).
		Where("?TableAlias.id = ?", id).
		Where("?TableAlias.revoked_at IS NULL").
		Exec(ctx)
	return err
}

func (r *sessionRepo) RevokeAllForUser(ctx context.Context, userID uuid.UUID) error {
	_, err := r.db.NewUpdate().Model((*Session)(nil)).
		Set("revoked_at = ?", time.Now().UTC()).
		Where("?TableAlias.user_id = ?", userID).
		Where("?TableAlias.revoked_at IS NULL").
		Exec(ctx)
	return err
}

func (r *sessionRepo) DeleteExpired(ctx context.Context) (int64, error) {
	res, err := r.db.NewDelete().Model((*Session)(nil)).
		Where("expires_at < ? OR revoked_at < ?", time.Now().UTC(), time.Now().UTC().Add(-7*24*time.Hour)).
		Exec(ctx)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}
