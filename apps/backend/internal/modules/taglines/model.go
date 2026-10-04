package taglines

import (
	"portfolio-backend/internal/shared"

	"github.com/uptrace/bun"
)

type Tagline struct {
	bun.BaseModel `bun:"table:taglines,alias:taglines"`

	shared.SoftDeleteModel `bun:",embed"`

	Text      string `bun:"text,notnull"`
	Context   string `bun:"context,notnull"`
	SortOrder int    `bun:"sort_order,notnull"`
	IsActive  bool   `bun:"is_active,notnull"`
}
