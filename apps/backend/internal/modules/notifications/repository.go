package notifications

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Repository interface {
	Enqueue(ctx context.Context, items ...*Outbox) error
	ClaimBatch(ctx context.Context, limit int) ([]*Outbox, error)
	MarkSent(ctx context.Context, id uuid.UUID) error
	MarkFailed(ctx context.Context, item *Outbox, errMsg string) error
	Stats(ctx context.Context) (*StatsDTO, error)
}

type repo struct {
	db *bun.DB
}

func NewRepository(db *bun.DB) Repository {
	return &repo{db: db}
}

func (r *repo) Enqueue(ctx context.Context, items ...*Outbox) error {
	if len(items) == 0 {
		return nil
	}
	now := time.Now().UTC()
	for _, it := range items {
		if it.ID == uuid.Nil {
			it.ID = uuid.New()
		}
		it.Status = StatusPending
		it.MaxAttempts = 5
		it.NextAttemptAt = now
		it.CreatedAt = now
		it.UpdatedAt = now
	}
	_, err := r.db.NewInsert().Model(&items).Exec(ctx)
	return err
}

// ClaimBatch atomically moves due rows to "sending" so concurrent dispatchers never double-send.
func (r *repo) ClaimBatch(ctx context.Context, limit int) ([]*Outbox, error) {
	var items []*Outbox
	err := r.db.NewUpdate().Model(&items).
		Set("status = ?", StatusSending).
		Set("updated_at = ?", time.Now().UTC()).
		Where("id IN (SELECT id FROM email_outbox WHERE status IN (?, ?) AND next_attempt_at <= ? AND attempts < max_attempts ORDER BY next_attempt_at LIMIT ? FOR UPDATE SKIP LOCKED)",
			StatusPending, StatusFailed, time.Now().UTC(), limit).
		Returning("*").
		Scan(ctx)
	return items, err
}

func (r *repo) MarkSent(ctx context.Context, id uuid.UUID) error {
	now := time.Now().UTC()
	_, err := r.db.NewUpdate().Model((*Outbox)(nil)).
		Set("status = ?", StatusSent).
		Set("sent_at = ?", now).
		Set("updated_at = ?", now).
		Set("attempts = attempts + 1").
		Set("last_error = ''").
		Where("id = ?", id).
		Exec(ctx)
	return err
}

func (r *repo) MarkFailed(ctx context.Context, item *Outbox, errMsg string) error {
	attempts := item.Attempts + 1
	backoff := time.Duration(1<<uint(attempts)) * time.Minute
	if backoff > 6*time.Hour {
		backoff = 6 * time.Hour
	}
	if len(errMsg) > 1000 {
		errMsg = errMsg[:1000]
	}
	_, err := r.db.NewUpdate().Model((*Outbox)(nil)).
		Set("status = ?", StatusFailed).
		Set("attempts = ?", attempts).
		Set("last_error = ?", errMsg).
		Set("next_attempt_at = ?", time.Now().UTC().Add(backoff)).
		Set("updated_at = ?", time.Now().UTC()).
		Where("id = ?", item.ID).
		Exec(ctx)
	return err
}

func (r *repo) Stats(ctx context.Context) (*StatsDTO, error) {
	out := &StatsDTO{}
	var err error
	if out.Pending, err = r.db.NewSelect().Model((*Outbox)(nil)).Where("status IN (?, ?)", StatusPending, StatusSending).Count(ctx); err != nil {
		return nil, err
	}
	if out.Failed, err = r.db.NewSelect().Model((*Outbox)(nil)).Where("status = ?", StatusFailed).Count(ctx); err != nil {
		return nil, err
	}
	if out.Sent24h, err = r.db.NewSelect().Model((*Outbox)(nil)).Where("status = ?", StatusSent).Where("sent_at > ?", time.Now().UTC().Add(-24*time.Hour)).Count(ctx); err != nil {
		return nil, err
	}
	return out, nil
}
