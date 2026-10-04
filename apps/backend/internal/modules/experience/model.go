package experience

import (
	"time"

	"portfolio-backend/internal/shared"

	"github.com/uptrace/bun"
)

type Experience struct {
	bun.BaseModel `bun:"table:experiences,alias:experiences"`

	shared.SoftDeleteModel `bun:",embed"`

	Company          string     `bun:"company,notnull"`
	CompanyURL       string     `bun:"company_url"`
	Role             string     `bun:"role,notnull"`
	EmploymentType   string     `bun:"employment_type,notnull"`
	Location         string     `bun:"location"`
	IsRemote         bool       `bun:"is_remote"`
	StartedAt        time.Time  `bun:"started_at,notnull"`
	EndedAt          *time.Time `bun:"ended_at"`
	IsCurrent        bool       `bun:"is_current"`
	Summary          string     `bun:"summary"`
	Responsibilities []string   `bun:"responsibilities,array"`
	Achievements     []string   `bun:"achievements,array"`
	Technologies     []string   `bun:"technologies,array"`
	LogoFileID       *string    `bun:"logo_file_id"`
	LogoURL          string     `bun:"logo_url"`
	SortOrder        int        `bun:"sort_order"`
	IsPublished      bool       `bun:"is_published"`
}
