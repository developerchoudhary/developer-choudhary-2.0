package reviews

import (
	"time"

	"portfolio-backend/internal/shared"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

const (
	StatusPending  = "pending"
	StatusApproved = "approved"
	StatusRejected = "rejected"
)

type Review struct {
	bun.BaseModel `bun:"table:reviews,alias:reviews"`

	shared.SoftDeleteModel `bun:",embed"`

	AuthorName         string     `bun:"author_name,notnull"`
	AuthorRole         string     `bun:"author_role"`
	AuthorCompany      string     `bun:"author_company"`
	AuthorEmail        string     `bun:"author_email"`
	AuthorWebsite      string     `bun:"author_website"`
	AuthorAvatarFileID *string    `bun:"author_avatar_file_id"`
	AuthorAvatarURL    string     `bun:"author_avatar_url"`
	Rating             int16      `bun:"rating,notnull"`
	Title              string     `bun:"title"`
	Body               string     `bun:"body,notnull"`
	ProjectID          *uuid.UUID `bun:"project_id"`
	ServiceSlug        string     `bun:"service_slug"`
	Source             string     `bun:"source,notnull"`
	Status             string     `bun:"status,notnull"`
	IsFeatured         bool       `bun:"is_featured"`
	SubmittedIP        string     `bun:"submitted_ip"`
	ApprovedAt         *time.Time `bun:"approved_at"`
	ApprovedBy         *uuid.UUID `bun:"approved_by"`
	ReviewedAt         *time.Time `bun:"reviewed_at"`
}
