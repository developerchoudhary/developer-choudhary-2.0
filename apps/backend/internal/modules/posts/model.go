package posts

import (
	"encoding/json"
	"time"

	"portfolio-backend/internal/shared"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

const (
	StatusDraft     = "draft"
	StatusScheduled = "scheduled"
	StatusPublished = "published"
	StatusArchived  = "archived"
)

type Post struct {
	bun.BaseModel `bun:"table:posts,alias:posts"`

	shared.SoftDeleteModel `bun:",embed"`

	Slug               string          `bun:"slug,notnull"`
	Title              string          `bun:"title,notnull"`
	Excerpt            string          `bun:"excerpt"`
	Content            json.RawMessage `bun:"content,type:jsonb"`
	ContentText        string          `bun:"content_text"`
	CoverFileID        *string         `bun:"cover_file_id"`
	CoverURL           string          `bun:"cover_url"`
	CoverAlt           string          `bun:"cover_alt"`
	CategoryID         *uuid.UUID      `bun:"category_id"`
	Status             string          `bun:"status,notnull"`
	PublishedAt        *time.Time      `bun:"published_at"`
	ScheduledFor       *time.Time      `bun:"scheduled_for"`
	ReadingTimeMinutes int             `bun:"reading_time_minutes"`
	ViewCount          int64           `bun:"view_count"`
	IsFeatured         bool            `bun:"is_featured"`
	SEOTitle           string          `bun:"seo_title"`
	SEODescription     string          `bun:"seo_description"`
	CanonicalURL       string          `bun:"canonical_url"`
	AuthorID           *uuid.UUID      `bun:"author_id"`

	Category *Category `bun:"rel:belongs-to,join:category_id=id"`
	Tags     []*Tag    `bun:"m2m:post_tag_links,join:Post=Tag"`
}

type Category struct {
	bun.BaseModel `bun:"table:post_categories,alias:post_categories"`

	shared.SoftDeleteModel `bun:",embed"`

	Slug        string `bun:"slug,notnull"`
	Name        string `bun:"name,notnull"`
	Description string `bun:"description"`
	Color       string `bun:"color"`
	SortOrder   int    `bun:"sort_order"`

	PostCount int `bun:"post_count,scanonly"`
}

type Tag struct {
	bun.BaseModel `bun:"table:post_tags,alias:post_tags"`

	shared.SoftDeleteModel `bun:",embed"`

	Slug string `bun:"slug,notnull"`
	Name string `bun:"name,notnull"`

	PostCount int `bun:"post_count,scanonly"`
}

type PostTagLink struct {
	bun.BaseModel `bun:"table:post_tag_links,alias:post_tag_links"`

	PostID uuid.UUID `bun:"post_id,pk"`
	TagID  uuid.UUID `bun:"tag_id,pk"`
	Post   *Post     `bun:"rel:belongs-to,join:post_id=id"`
	Tag    *Tag      `bun:"rel:belongs-to,join:tag_id=id"`
}
