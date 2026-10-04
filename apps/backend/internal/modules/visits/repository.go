package visits

import (
	"context"
	"time"

	"portfolio-backend/pkg/pagination"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Repository interface {
	Create(ctx context.Context, item *Visit) error
	List(ctx context.Context, query *pagination.ListQuery) ([]*Visit, int, error)
	Stats(ctx context.Context, days int) (*StatsDTO, error)
	DeleteOlderThan(ctx context.Context, cutoff time.Time) (int64, error)
}

type repo struct {
	db *bun.DB
}

func NewRepository(db *bun.DB) Repository {
	return &repo{db: db}
}

func (r *repo) Create(ctx context.Context, item *Visit) error {
	item.ID = uuid.New()
	item.CreatedAt = time.Now().UTC()
	_, err := r.db.NewInsert().Model(item).Exec(ctx)
	return err
}

func (r *repo) List(ctx context.Context, query *pagination.ListQuery) ([]*Visit, int, error) {
	var items []*Visit
	q := query.ApplyFilters(r.db.NewSelect().Model(&items), ListSchema)
	count, err := q.Count(ctx)
	if err != nil {
		return nil, 0, err
	}
	if err := query.ApplySort(q, ListSchema).Limit(query.Limit()).Offset(query.Offset()).Scan(ctx); err != nil {
		return nil, 0, err
	}
	return items, count, nil
}

func (r *repo) Stats(ctx context.Context, days int) (*StatsDTO, error) {
	if days <= 0 {
		days = 30
	}
	now := time.Now().UTC()
	since := now.Add(-time.Duration(days) * 24 * time.Hour)
	prevSince := since.Add(-time.Duration(days) * 24 * time.Hour)
	today := now.Truncate(24 * time.Hour)
	out := &StatsDTO{RangeDays: days}
	var err error

	base := func() *bun.SelectQuery {
		return r.db.NewSelect().Model((*Visit)(nil)).Where("created_at > ?", since)
	}
	prev := func() *bun.SelectQuery {
		return r.db.NewSelect().Model((*Visit)(nil)).Where("created_at > ?", prevSince).Where("created_at <= ?", since)
	}
	if out.Views, err = base().Count(ctx); err != nil {
		return nil, err
	}
	if err = base().ColumnExpr("COUNT(DISTINCT visitor_id)").Scan(ctx, &out.Visitors); err != nil {
		return nil, err
	}
	if out.PrevViews, err = prev().Count(ctx); err != nil {
		return nil, err
	}
	if err = prev().ColumnExpr("COUNT(DISTINCT visitor_id)").Scan(ctx, &out.PrevVisitors); err != nil {
		return nil, err
	}
	todayQ := func() *bun.SelectQuery {
		return r.db.NewSelect().Model((*Visit)(nil)).Where("created_at >= ?", today)
	}
	if out.ViewsToday, err = todayQ().Count(ctx); err != nil {
		return nil, err
	}
	if err = todayQ().ColumnExpr("COUNT(DISTINCT visitor_id)").Scan(ctx, &out.VisitorsToday); err != nil {
		return nil, err
	}
	var consented int
	if consented, err = base().Where("consent_location = TRUE").Count(ctx); err != nil {
		return nil, err
	}
	if out.Views > 0 {
		out.ConsentRate = float64(consented) / float64(out.Views)
	}
	var avg *float64
	if err = base().ColumnExpr("AVG(duration_ms)").Where("duration_ms IS NOT NULL AND duration_ms > 0").Scan(ctx, &avg); err != nil {
		return nil, err
	}
	if avg != nil {
		out.AvgDurationMs = int(*avg)
	}

	top := func(col string, dest *[]CountDTO, limit int) error {
		return base().ColumnExpr(col+" AS label, COUNT(*) AS count").
			Where(col+" <> ''").GroupExpr(col).OrderExpr("count DESC").Limit(limit).Scan(ctx, dest)
	}
	if err = top("path", &out.TopPages, 10); err != nil {
		return nil, err
	}
	if err = top("country", &out.TopCountries, 10); err != nil {
		return nil, err
	}
	if err = top("city", &out.TopCities, 10); err != nil {
		return nil, err
	}
	if err = top("referrer", &out.TopReferrers, 10); err != nil {
		return nil, err
	}
	if err = top("device", &out.Devices, 3); err != nil {
		return nil, err
	}
	if err = base().ColumnExpr("to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, COUNT(*) AS views, COUNT(DISTINCT visitor_id) AS visitors").
		GroupExpr("1").OrderExpr("1 ASC").Scan(ctx, &out.Daily); err != nil {
		return nil, err
	}
	if err = base().ColumnExpr("EXTRACT(HOUR FROM created_at)::int AS hour, COUNT(*) AS views").
		GroupExpr("1").OrderExpr("1 ASC").Scan(ctx, &out.Hourly); err != nil {
		return nil, err
	}
	if err = base().ColumnExpr("ROUND(latitude::numeric, 2)::float8 AS latitude, ROUND(longitude::numeric, 2)::float8 AS longitude, MIN(city) AS city, MIN(country) AS country, COUNT(*) AS count").
		Where("consent_location = TRUE AND latitude IS NOT NULL AND longitude IS NOT NULL").
		GroupExpr("1, 2").OrderExpr("count DESC").Limit(500).Scan(ctx, &out.LocationPoints); err != nil {
		return nil, err
	}
	for _, s := range []*[]CountDTO{&out.TopPages, &out.TopCountries, &out.TopCities, &out.TopReferrers, &out.Devices} {
		if *s == nil {
			*s = []CountDTO{}
		}
	}
	if out.Daily == nil {
		out.Daily = []DayDTO{}
	}
	if out.Hourly == nil {
		out.Hourly = []HourDTO{}
	}
	if out.LocationPoints == nil {
		out.LocationPoints = []PointDTO{}
	}
	return out, nil
}

func (r *repo) DeleteOlderThan(ctx context.Context, cutoff time.Time) (int64, error) {
	res, err := r.db.NewDelete().Model((*Visit)(nil)).Where("created_at < ?", cutoff).Exec(ctx)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}
