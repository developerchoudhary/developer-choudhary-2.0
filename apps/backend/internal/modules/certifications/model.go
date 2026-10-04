package certifications

import (
	"time"

	"portfolio-backend/internal/shared"

	"github.com/uptrace/bun"
)

type Certification struct {
	bun.BaseModel `bun:"table:certifications,alias:certifications"`

	shared.SoftDeleteModel `bun:",embed"`

	Name          string     `bun:"name,notnull"`
	Issuer        string     `bun:"issuer"`
	IssuedAt      *time.Time `bun:"issued_at"`
	ExpiresAt     *time.Time `bun:"expires_at"`
	CredentialID  string     `bun:"credential_id"`
	CredentialURL string     `bun:"credential_url"`
	SortOrder     int        `bun:"sort_order"`
	IsPublished   bool       `bun:"is_published"`
}
