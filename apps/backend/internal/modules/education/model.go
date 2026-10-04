package education

import (
	"time"

	"portfolio-backend/internal/shared"

	"github.com/uptrace/bun"
)

type Education struct {
	bun.BaseModel `bun:"table:education,alias:education"`

	shared.SoftDeleteModel `bun:",embed"`

	Institution string     `bun:"institution,notnull"`
	Degree      string     `bun:"degree,notnull"`
	Field       string     `bun:"field"`
	Location    string     `bun:"location"`
	StartedAt   *time.Time `bun:"started_at"`
	EndedAt     *time.Time `bun:"ended_at"`
	Grade       string     `bun:"grade"`
	Description string     `bun:"description"`
	SortOrder   int        `bun:"sort_order"`
	IsPublished bool       `bun:"is_published"`
}
