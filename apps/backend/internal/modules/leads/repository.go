package leads

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"portfolio-backend/pkg/httputil"
	"portfolio-backend/pkg/pagination"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Repository interface {
	Create(ctx context.Context, item *Lead) error
	Get(ctx context.Context, id uuid.UUID) (*Lead, error)
	List(ctx context.Context, query *pagination.ListQuery) ([]*Lead, int, error)
	All(ctx context.Context, query *pagination.ListQuery) ([]*Lead, error)
	Recent(ctx context.Context, limit int) ([]*Lead, error)
	Update(ctx context.Context, item *Lead) error
	SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error
	AddNote(ctx context.Context, note *Note) error
	Stats(ctx context.Context) (*StatsDTO, error)
	CountRecentFromIP(ctx context.Context, ip string, since time.Time) (int, error)
}

type repo struct {
	db *bun.DB
}

func NewRepository(db *bun.DB) Repository {
	return &repo{db: db}
}

func (r *repo) Create(ctx context.Context, item *Lead) error {
	now := time.Now().UTC()
	if item.ID == uuid.Nil {
		item.ID = uuid.New()
	}
	item.CreatedAt, item.UpdatedAt = now, now
	if len(item.UTM) == 0 {
		item.UTM = []byte("{}")
	}
	_, err := r.db.NewInsert().Model(item).Exec(ctx)
	return err
}

func (r *repo) Get(ctx context.Context, id uuid.UUID) (*Lead, error) {
	item := new(Lead)
	err := r.db.NewSelect().Model(item).
		Relation("Notes", func(q *bun.SelectQuery) *bun.SelectQuery { return q.Order("created_at DESC") }).
		Where("?TableAlias.id = ?", id).
		Where("?TableAlias.deleted_at IS NULL").
		Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, httputil.NotFound("lead not found")
		}
		return nil, err
	}
	return item, nil
}

func (r *repo) base(query *pagination.ListQuery, items *[]*Lead) *bun.SelectQuery {
	q := r.db.NewSelect().Model(items).Where("?TableAlias.deleted_at IS NULL")
	return query.ApplyFilters(q, ListSchema)
}

func (r *repo) List(ctx context.Context, query *pagination.ListQuery) ([]*Lead, int, error) {
	var items []*Lead
	q := r.base(query, &items)
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

func (r *repo) All(ctx context.Context, query *pagination.ListQuery) ([]*Lead, error) {
	var items []*Lead
	err := query.ApplySort(r.base(query, &items), ListSchema).Limit(5000).Scan(ctx)
	return items, err
}

func (r *repo) Recent(ctx context.Context, limit int) ([]*Lead, error) {
	var items []*Lead
	err := r.db.NewSelect().Model(&items).
		Where("?TableAlias.deleted_at IS NULL").
		Where("?TableAlias.status <> 'spam'").
		Order("created_at DESC").Limit(limit).Scan(ctx)
	return items, err
}

func (r *repo) Update(ctx context.Context, item *Lead) error {
	item.UpdatedAt = time.Now().UTC()
	res, err := r.db.NewUpdate().Model(item).
		Column("status", "priority", "is_spam", "contacted_at", "closed_at", "notified_at", "updated_by", "updated_at").
		Where("?TableAlias.id = ?", item.ID).
		Where("?TableAlias.deleted_at IS NULL").
		Exec(ctx)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return httputil.NotFound("lead not found")
	}
	return nil
}

func (r *repo) SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error {
	res, err := r.db.NewUpdate().Model((*Lead)(nil)).
		Set("deleted_at = ?", time.Now().UTC()).
		Set("deleted_by = ?", deletedBy).
		Where("?TableAlias.id = ?", id).
		Where("?TableAlias.deleted_at IS NULL").
		Exec(ctx)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return httputil.NotFound("lead not found")
	}
	return nil
}

func (r *repo) AddNote(ctx context.Context, note *Note) error {
	note.ID = uuid.New()
	note.CreatedAt = time.Now().UTC()
	_, err := r.db.NewInsert().Model(note).Exec(ctx)
	return err
}

type statusRow struct {
	Status string `bun:"status"`
	Count  int    `bun:"count"`
}

func (r *repo) Stats(ctx context.Context) (*StatsDTO, error) {
	var rows []statusRow
	if err := r.db.NewSelect().Model((*Lead)(nil)).
		ColumnExpr("status, COUNT(*) AS count").
		Where("deleted_at IS NULL").
		Group("status").
		Scan(ctx, &rows); err != nil {
		return nil, err
	}
	out := &StatsDTO{ByStatus: map[string]int{}}
	for _, s := range Statuses {
		out.ByStatus[s] = 0
	}
	for _, row := range rows {
		out.ByStatus[row.Status] = row.Count
		out.Total += row.Count
	}
	recent, err := r.db.NewSelect().Model((*Lead)(nil)).
		Where("deleted_at IS NULL").
		Where("created_at > ?", time.Now().UTC().Add(-7*24*time.Hour)).
		Count(ctx)
	if err != nil {
		return nil, err
	}
	out.Last7Days = recent
	since30 := time.Now().UTC().Add(-30 * 24 * time.Hour)
	if out.Last30Days, err = r.db.NewSelect().Model((*Lead)(nil)).
		Where("deleted_at IS NULL").Where("created_at > ?", since30).Count(ctx); err != nil {
		return nil, err
	}
	if err = r.db.NewSelect().Model((*Lead)(nil)).
		ColumnExpr("to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, COUNT(*) AS count").
		Where("deleted_at IS NULL").Where("created_at > ?", since30).
		GroupExpr("1").OrderExpr("1 ASC").Scan(ctx, &out.Daily); err != nil {
		return nil, err
	}
	if out.Daily == nil {
		out.Daily = []DayCountDTO{}
	}
	return out, nil
}

func (r *repo) CountRecentFromIP(ctx context.Context, ip string, since time.Time) (int, error) {
	if ip == "" {
		return 0, nil
	}
	return r.db.NewSelect().Model((*Lead)(nil)).Where("ip_address = ?", ip).Where("created_at > ?", since).Count(ctx)
}
