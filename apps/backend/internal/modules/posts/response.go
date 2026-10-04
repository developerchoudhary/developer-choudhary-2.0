package posts

import (
	"encoding/json"
	"time"

	"portfolio-backend/internal/shared"
)

type CategoryDTO struct {
	ID          string `json:"id"`
	Slug        string `json:"slug"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Color       string `json:"color"`
	SortOrder   int    `json:"sortOrder"`
	PostCount   int    `json:"postCount"`
}

type TagDTO struct {
	ID        string `json:"id"`
	Slug      string `json:"slug"`
	Name      string `json:"name"`
	PostCount int    `json:"postCount"`
}

type ResponseDTO struct {
	ID                 string          `json:"id"`
	Slug               string          `json:"slug"`
	Title              string          `json:"title"`
	Excerpt            string          `json:"excerpt"`
	Content            json.RawMessage `json:"content,omitempty"`
	CoverFileID        *string         `json:"coverFileId"`
	CoverURL           string          `json:"coverUrl"`
	CoverAlt           string          `json:"coverAlt"`
	Category           *CategoryDTO    `json:"category"`
	Tags               []TagDTO        `json:"tags"`
	Status             string          `json:"status"`
	PublishedAt        *string         `json:"publishedAt"`
	ScheduledFor       *string         `json:"scheduledFor"`
	ReadingTimeMinutes int             `json:"readingTimeMinutes"`
	ViewCount          int64           `json:"viewCount"`
	IsFeatured         bool            `json:"isFeatured"`
	SEOTitle           string          `json:"seoTitle"`
	SEODescription     string          `json:"seoDescription"`
	CanonicalURL       string          `json:"canonicalUrl"`
	CreatedAt          string          `json:"createdAt"`
	UpdatedAt          string          `json:"updatedAt"`
}

func ToCategory(c *Category) *CategoryDTO {
	if c == nil {
		return nil
	}
	return &CategoryDTO{
		ID:          c.ID.String(),
		Slug:        c.Slug,
		Name:        c.Name,
		Description: c.Description,
		Color:       c.Color,
		SortOrder:   c.SortOrder,
		PostCount:   c.PostCount,
	}
}

func ToCategoryList(items []*Category) []*CategoryDTO {
	out := make([]*CategoryDTO, 0, len(items))
	for _, it := range items {
		out = append(out, ToCategory(it))
	}
	return out
}

func ToTag(t *Tag) TagDTO {
	return TagDTO{ID: t.ID.String(), Slug: t.Slug, Name: t.Name, PostCount: t.PostCount}
}

func ToTagList(items []*Tag) []TagDTO {
	out := make([]TagDTO, 0, len(items))
	for _, it := range items {
		out = append(out, ToTag(it))
	}
	return out
}

func ToResponse(p *Post, full bool) *ResponseDTO {
	if p == nil {
		return nil
	}
	dto := &ResponseDTO{
		ID:                 p.ID.String(),
		Slug:               p.Slug,
		Title:              p.Title,
		Excerpt:            p.Excerpt,
		CoverFileID:        p.CoverFileID,
		CoverURL:           p.CoverURL,
		CoverAlt:           p.CoverAlt,
		Category:           ToCategory(p.Category),
		Tags:               ToTagList(p.Tags),
		Status:             p.Status,
		PublishedAt:        shared.FormatTime(p.PublishedAt),
		ScheduledFor:       shared.FormatTime(p.ScheduledFor),
		ReadingTimeMinutes: p.ReadingTimeMinutes,
		ViewCount:          p.ViewCount,
		IsFeatured:         p.IsFeatured,
		SEOTitle:           p.SEOTitle,
		SEODescription:     p.SEODescription,
		CanonicalURL:       p.CanonicalURL,
		CreatedAt:          p.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt:          p.UpdatedAt.UTC().Format(time.RFC3339),
	}
	if full {
		dto.Content = p.Content
		if len(dto.Content) == 0 {
			dto.Content = json.RawMessage("[]")
		}
	}
	return dto
}

func ToListResponse(items []*Post) []*ResponseDTO {
	out := make([]*ResponseDTO, 0, len(items))
	for _, it := range items {
		out = append(out, ToResponse(it, false))
	}
	return out
}
