package pagination

import (
	"database/sql"
	"strings"
	"testing"

	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
)

type project struct {
	bun.BaseModel `bun:"table:projects,alias:projects"`
	ID            string `bun:"id"`
}

func TestContainsFilter(t *testing.T) {
	db := bun.NewDB(&sql.DB{}, pgdialect.New())
	schema := Schema{Filters: map[string]FilterDef{
		"service": {Column: "projects.service_slugs", Type: TypeString, Contains: true, Multi: true},
	}}
	one := &ListQuery{Raw: map[string][]string{"service": {"crm-portals"}}}
	sql := one.ApplyFilters(db.NewSelect().Model((*project)(nil)), schema).String()
	if !strings.Contains(sql, "'crm-portals' = ANY(projects.service_slugs)") {
		t.Fatalf("single value: %s", sql)
	}
	many := &ListQuery{Raw: map[string][]string{"service": {"crm-portals", "erp-systems"}}}
	sql = many.ApplyFilters(db.NewSelect().Model((*project)(nil)), schema).String()
	if !strings.Contains(sql, "projects.service_slugs && ARRAY['crm-portals', 'erp-systems']::text[]") {
		t.Fatalf("multiple values: %s", sql)
	}
}
