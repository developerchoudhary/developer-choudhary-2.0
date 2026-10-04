package skills

import (
	"portfolio-backend/internal/shared"

	"github.com/uptrace/bun"
)

type Skill struct {
	bun.BaseModel `bun:"table:skills,alias:skills"`

	shared.SoftDeleteModel `bun:",embed"`

	Name        string `bun:"name,notnull"`
	Category    string `bun:"category,notnull"`
	IsFeatured  bool   `bun:"is_featured"`
	IsPublished bool   `bun:"is_published"`
	SortOrder   int    `bun:"sort_order"`
}

var Categories = []string{"frontend", "backend", "database", "devops", "cloud", "tools", "design", "other"}
