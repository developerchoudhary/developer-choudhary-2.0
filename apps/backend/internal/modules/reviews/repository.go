package reviews

import (
	"context"

	"portfolio-backend/internal/shared"
	"portfolio-backend/pkg/pagination"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Repository interface {
	Create(ctx context.Context, item *Review) error
	Get(ctx context.Context, id uuid.UUID) (*Review, error)
	List(ctx context.Context, query *pagination.ListQuery) ([]*Review, int, error)
	ListApproved(ctx context.Context, featuredOnly bool, limit int) ([]*Review, error)
	Summary(ctx context.Context) (*SummaryDTO, error)
	Update(ctx context.Context, item *Review) error
	SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error
	CountPending(ctx context.Context) (int, error)
}

type repo struct {
	db *bun.DB
}

func NewRepository(db *bun.DB) Repository {
	return &repo{db: db}
}

func (r *repo) Create(ctx context.Context, item *Review) error {
	return shared.Insert(ctx, r.db, item)
}

func (r *repo) Get(ctx context.Context, id uuid.UUID) (*Review, error) {
	return shared.FindByID[Review](ctx, r.db, id, "review not found")
}

func (r *repo) List(ctx context.Context, query *pagination.ListQuery) ([]*Review, int, error) {
	var items []*Review
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

func (r *repo) ListApproved(ctx context.Context, featuredOnly bool, limit int) ([]*Review, error) {
	var items []*Review
	q := r.db.NewSelect().Model(&items).
		Where("?TableAlias.deleted_at IS NULL").
		Where("?TableAlias.status = ?", StatusApproved)
	if featuredOnly {
		q = q.Where("?TableAlias.is_featured = TRUE")
	}
	q = q.OrderExpr("is_featured DESC, COALESCE(reviewed_at, created_at::date) DESC, created_at DESC")
	if limit > 0 {
		q = q.Limit(limit)
	}
	err := q.Scan(ctx)
	return items, err
}

type summaryRow struct {
	Rating int `bun:"rating"`
	Count  int `bun:"count"`
}

func (r *repo) Summary(ctx context.Context) (*SummaryDTO, error) {
	var rows []summaryRow
	err := r.db.NewSelect().Model((*Review)(nil)).
		ColumnExpr("rating, COUNT(*) AS count").
		Where("deleted_at IS NULL").
		Where("status = ?", StatusApproved).
		Group("rating").
		Scan(ctx, &rows)
	if err != nil {
		return nil, err
	}
	out := &SummaryDTO{Distribution: map[string]int{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}}
	total := 0
	for _, row := range rows {
		out.Distribution[itoa(row.Rating)] = row.Count
		out.Count += row.Count
		total += row.Rating * row.Count
	}
	if out.Count > 0 {
		out.Average = float64(int((float64(total)/float64(out.Count))*10+0.5)) / 10
	}
	return out, nil
}

func itoa(n int) string {
	return string(rune('0' + n))
}

func (r *repo) Update(ctx context.Context, item *Review) error {
	return shared.UpdateColumns(ctx, r.db, item, item.ID, "review not found",
		"author_name", "author_role", "author_company", "author_email", "author_website", "author_avatar_file_id", "author_avatar_url",
		"rating", "title", "body", "project_id", "service_slug", "source", "status", "is_featured", "approved_at", "approved_by",
		"reviewed_at", "updated_by", "updated_at")
}

func (r *repo) SoftDelete(ctx context.Context, id, deletedBy uuid.UUID) error {
	return shared.SoftDelete[Review](ctx, r.db, id, deletedBy, "review not found")
}

func (r *repo) CountPending(ctx context.Context) (int, error) {
	return r.db.NewSelect().Model((*Review)(nil)).Where("deleted_at IS NULL").Where("status = ?", StatusPending).Count(ctx)
}
