package posts

import (
	"encoding/json"

	"github.com/google/uuid"
)

type RequestDTO struct {
	Slug           string          `json:"slug" binding:"max=96"`
	Title          string          `json:"title" binding:"required,min=2,max=160"`
	Excerpt        string          `json:"excerpt" binding:"max=600"`
	Content        json.RawMessage `json:"content"`
	CoverFileID    *string         `json:"coverFileId"`
	CoverURL       string          `json:"coverUrl" binding:"max=500"`
	CoverAlt       string          `json:"coverAlt" binding:"max=300"`
	CategoryID     *uuid.UUID      `json:"categoryId"`
	TagIDs         []uuid.UUID     `json:"tagIds" binding:"max=12"`
	NewTags        []string        `json:"newTags" binding:"max=12,dive,max=40"`
	Status         string          `json:"status" binding:"required,oneof=draft scheduled published archived"`
	PublishedAt    *string         `json:"publishedAt"`
	ScheduledFor   *string         `json:"scheduledFor"`
	IsFeatured     *bool           `json:"isFeatured"`
	SEOTitle       string          `json:"seoTitle" binding:"max=70"`
	SEODescription string          `json:"seoDescription" binding:"max=170"`
	CanonicalURL   string          `json:"canonicalUrl" binding:"omitempty,url,max=400"`
}

type CategoryRequest struct {
	Slug        string `json:"slug" binding:"max=96"`
	Name        string `json:"name" binding:"required,min=2,max=80"`
	Description string `json:"description" binding:"max=300"`
	Color       string `json:"color" binding:"max=30"`
	SortOrder   int    `json:"sortOrder"`
}

type TagRequest struct {
	Slug string `json:"slug" binding:"max=96"`
	Name string `json:"name" binding:"required,min=1,max=40"`
}
