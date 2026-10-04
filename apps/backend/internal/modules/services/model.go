package services

import (
	"encoding/json"

	"portfolio-backend/internal/shared"

	"github.com/uptrace/bun"
)

type Service struct {
	bun.BaseModel `bun:"table:services,alias:services"`

	shared.SoftDeleteModel `bun:",embed"`

	Slug               string          `bun:"slug,notnull"`
	Title              string          `bun:"title,notnull"`
	Tagline            string          `bun:"tagline"`
	Summary            string          `bun:"summary"`
	Description        json.RawMessage `bun:"description,type:jsonb"`
	Icon               string          `bun:"icon"`
	Deliverables       []string        `bun:"deliverables,array"`
	TechStack          []string        `bun:"tech_stack,array"`
	IdealFor           []string        `bun:"ideal_for,array"`
	StartingPriceLabel string          `bun:"starting_price_label"`
	TimelineLabel      string          `bun:"timeline_label"`
	FAQs               json.RawMessage `bun:"faqs,type:jsonb"`
	CoverFileID        *string         `bun:"cover_file_id"`
	CoverURL           string          `bun:"cover_url"`
	SEOTitle           string          `bun:"seo_title"`
	SEODescription     string          `bun:"seo_description"`
	SortOrder          int             `bun:"sort_order"`
	IsFeatured         bool            `bun:"is_featured"`
	IsPublished        bool            `bun:"is_published"`
}

type FAQ struct {
	Question string `json:"question" binding:"required,max=300"`
	Answer   string `json:"answer" binding:"required,max=3000"`
}
