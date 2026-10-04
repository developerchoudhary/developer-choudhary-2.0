package projects

import (
	"encoding/json"
	"time"

	"portfolio-backend/internal/shared"

	"github.com/uptrace/bun"
)

var Types = []string{"website", "erp", "crm", "web-app", "ecommerce", "api", "mobile", "devops", "other"}

// Statuses describe where a project is in its life: announced, being built, or shipped.
var Statuses = []string{"upcoming", "in-progress", "completed"}

const StatusCompleted = "completed"

type Project struct {
	bun.BaseModel `bun:"table:projects,alias:projects"`

	shared.SoftDeleteModel `bun:",embed"`

	Slug           string          `bun:"slug,notnull"`
	Title          string          `bun:"title,notnull"`
	Subtitle       string          `bun:"subtitle"`
	Summary        string          `bun:"summary"`
	Description    json.RawMessage `bun:"description,type:jsonb"`
	ClientName     string          `bun:"client_name"`
	ClientIndustry string          `bun:"client_industry"`
	ProjectType    string          `bun:"project_type,notnull"`
	Status         string          `bun:"status,notnull"`
	LiveURL        string          `bun:"live_url"`
	RepoURL        string          `bun:"repo_url"`
	CoverFileID    *string         `bun:"cover_file_id"`
	CoverURL       string          `bun:"cover_url"`
	Gallery        json.RawMessage `bun:"gallery,type:jsonb"`
	Technologies   []string        `bun:"technologies,array"`
	ServiceSlugs   []string        `bun:"service_slugs,array"`
	Highlights     json.RawMessage `bun:"highlights,type:jsonb"`
	Role           string          `bun:"role"`
	StartedAt      *time.Time      `bun:"started_at"`
	CompletedAt    *time.Time      `bun:"completed_at"`
	IsFeatured     bool            `bun:"is_featured"`
	IsPublished    bool            `bun:"is_published"`
	SortOrder      int             `bun:"sort_order"`
	SEOTitle       string          `bun:"seo_title"`
	SEODescription string          `bun:"seo_description"`
}

type GalleryItem struct {
	FileID  string `json:"fileId" binding:"max=64"`
	URL     string `json:"url" binding:"required,max=500"`
	Alt     string `json:"alt" binding:"max=300"`
	Caption string `json:"caption" binding:"max=300"`
	Width   int    `json:"width"`
	Height  int    `json:"height"`
}

type Highlight struct {
	Label string `json:"label" binding:"required,max=80"`
	Value string `json:"value" binding:"required,max=80"`
}
