package pagination

import (
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"portfolio-backend/pkg/dateparse"
)

// ////////////////////////////////////////////////////////////
// ////////////////// Filter Field Types //////////////////////
// ////////////////////////////////////////////////////////////
type FieldType int

const (
	TypeString FieldType = iota
	TypeUUID
	TypeEnum
	TypeNumber
	TypeDate
	TypeBool
)

// ////////////////////////////////////////////////////////////
// ////////////////// Filter Definition ///////////////////////
// ////////////////////////////////////////////////////////////
// FilterDef declares a single filterable field. Column MUST be a
// developer-defined, fully-qualified column (e.g. "invoice.office_id");
// it is never derived from user input, which keeps filtering safe from
// SQL injection. All user-supplied values are passed as bind params.
type FilterDef struct {
	Column string    // qualified column, e.g. "invoice.office_id"
	Type   FieldType // value type used for parsing/binding
	Multi  bool      // allow CSV / repeated params -> SQL IN
	Range  bool      // allow <param>From / <param>To range filtering
}

// Join is an explicit LEFT JOIN used to enable search/filter on related
// tables. Use aliases distinct from Bun's Relation() auto-joins (e.g. s_client).
type Join struct {
	SQL string
}

// ////////////////////////////////////////////////////////////
// /////////////////////// List Schema ////////////////////////
// ////////////////////////////////////////////////////////////
// Schema is the per-entity whitelist that drives sorting, filtering and
// searching. Modules own their Schema so the shared package never needs
// to know entity specifics.
type Schema struct {
	SortColumns map[string]string    // apiName -> qualified column
	DefaultSort string               // qualified column used when sortBy is absent/invalid
	Filters     map[string]FilterDef // query param -> filter definition
	SearchJoins []Join               // joins required to search related columns
	SearchCols  []string             // qualified columns matched by free-text search
}

// ////////////////////////////////////////////////////////////
// /////////////////////// List Query /////////////////////////
// ////////////////////////////////////////////////////////////
// ListQuery extends the pagination Request with sorting, search and the
// raw (already collected) filter values declared by a Schema.
type ListQuery struct {
	Request

	SortBy string
	Search string
	Raw    map[string][]string
}

// ////////////////////////////////////////////////////////////
// ////////////// Parse List Query from Context ///////////////
// ////////////////////////////////////////////////////////////
func ParseList(c *gin.Context, schema Schema) *ListQuery {
	base := Parse(c)

	lq := &ListQuery{
		Request: *base,
		SortBy:  strings.TrimSpace(c.Query("sortBy")),
		Search:  strings.TrimSpace(c.Query("search")),
		Raw:     map[string][]string{},
	}

	// sortOrder is the explicit param; fall back to legacy `sort` (already
	// parsed into base.Sort by Parse) when sortOrder is absent.
	if so := strings.TrimSpace(c.Query("sortOrder")); so != "" {
		lq.Sort = SortOrder(strings.ToLower(so))
	}

	for param, def := range schema.Filters {
		if def.Range {
			if v := strings.TrimSpace(c.Query(param + "From")); v != "" {
				lq.Raw[param+"From"] = []string{v}
			}
			if v := strings.TrimSpace(c.Query(param + "To")); v != "" {
				lq.Raw[param+"To"] = []string{v}
			}
		}

		vals, ok := c.GetQueryArray(param)
		if !ok {
			continue
		}

		collected := make([]string, 0, len(vals))
		for _, val := range vals {
			if def.Multi {
				for _, part := range strings.Split(val, ",") {
					if part = strings.TrimSpace(part); part != "" {
						collected = append(collected, part)
					}
				}
			} else if v := strings.TrimSpace(val); v != "" {
				collected = append(collected, v)
			}
		}
		if len(collected) > 0 {
			lq.Raw[param] = collected
		}
	}

	return lq
}

// ////////////////////////////////////////////////////////////
// ////////////// Apply Filters + Search to Query /////////////
// ////////////////////////////////////////////////////////////
// ApplyFilters appends WHERE clauses for the declared filters and the
// free-text search. It is intended to be applied to BOTH the data query
// and the count query so totals respect the active filters.
func (lq *ListQuery) ApplyFilters(q *bun.SelectQuery, schema Schema) *bun.SelectQuery {
	searching := lq.Search != "" && len(schema.SearchCols) > 0

	if searching {
		for _, j := range schema.SearchJoins {
			q = q.Join(j.SQL)
		}
	}

	for param, def := range schema.Filters {
		if def.Range {
			if from, ok := lq.Raw[param+"From"]; ok && len(from) > 0 {
				if v, ok := convertSingle(from[0], def.Type); ok {
					q = q.Where(def.Column+" >= ?", v)
				}
			}
			if to, ok := lq.Raw[param+"To"]; ok && len(to) > 0 {
				if v, ok := convertSingle(to[0], def.Type); ok {
					q = q.Where(def.Column+" <= ?", v)
				}
			}
		}

		vals, ok := lq.Raw[param]
		if !ok || len(vals) == 0 {
			continue
		}

		converted := convertValues(vals, def.Type)
		if len(converted) == 0 {
			continue
		}

		if def.Multi && len(converted) > 1 {
			q = q.Where(def.Column+" IN (?)", bun.In(converted))
		} else {
			q = q.Where(def.Column+" = ?", converted[0])
		}
	}

	if searching {
		term := "%" + lq.Search + "%"
		q = q.WhereGroup(" AND ", func(sq *bun.SelectQuery) *bun.SelectQuery {
			for _, col := range schema.SearchCols {
				sq = sq.WhereOr(col+"::text ILIKE ?", term)
			}
			return sq
		})
	}

	return q
}

// ////////////////////////////////////////////////////////////
// /////////////////// Apply Sort to Query ////////////////////
// ////////////////////////////////////////////////////////////
func (lq *ListQuery) ApplySort(q *bun.SelectQuery, schema Schema) *bun.SelectQuery {
	col := schema.DefaultSort
	if lq.SortBy != "" {
		if mapped, ok := schema.SortColumns[lq.SortBy]; ok {
			col = mapped
		}
	}
	if col == "" {
		col = "created_at"
	}

	order := strings.ToUpper(string(lq.Sort))
	if order != "ASC" && order != "DESC" {
		order = "DESC"
	}

	return q.Order(col + " " + order)
}

// ////////////////////////////////////////////////////////////
// ////////////////// Value Conversion Helpers ////////////////
// ////////////////////////////////////////////////////////////
func convertSingle(s string, t FieldType) (interface{}, bool) {
	s = strings.TrimSpace(s)
	if s == "" {
		return nil, false
	}

	switch t {
	case TypeUUID:
		id, err := uuid.Parse(s)
		if err != nil {
			return nil, false
		}
		return id, true
	case TypeNumber:
		f, err := strconv.ParseFloat(s, 64)
		if err != nil {
			return nil, false
		}
		return f, true
	case TypeBool:
		b, err := strconv.ParseBool(s)
		if err != nil {
			return nil, false
		}
		return b, true
	case TypeDate:
		ts, err := dateparse.ParseDate(s)
		if err != nil {
			return nil, false
		}
		return *ts, true
	default:
		return s, true
	}
}

func convertValues(vals []string, t FieldType) []interface{} {
	out := make([]interface{}, 0, len(vals))
	for _, v := range vals {
		if cv, ok := convertSingle(v, t); ok {
			out = append(out, cv)
		}
	}
	return out
}
