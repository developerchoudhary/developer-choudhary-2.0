package services

import (
	"encoding/json"
)

type RequestDTO struct {
	Slug               string          `json:"slug" binding:"max=96"`
	Title              string          `json:"title" binding:"required,min=2,max=120"`
	Tagline            string          `json:"tagline" binding:"max=200"`
	Summary            string          `json:"summary" binding:"max=1000"`
	Description        json.RawMessage `json:"description"`
	Icon               string          `json:"icon" binding:"max=40"`
	Deliverables       []string        `json:"deliverables" binding:"max=30,dive,max=200"`
	TechStack          []string        `json:"techStack" binding:"max=40,dive,max=60"`
	IdealFor           []string        `json:"idealFor" binding:"max=20,dive,max=120"`
	StartingPriceLabel string          `json:"startingPriceLabel" binding:"max=80"`
	TimelineLabel      string          `json:"timelineLabel" binding:"max=80"`
	FAQs               []FAQ           `json:"faqs" binding:"max=20,dive"`
	CoverFileID        *string         `json:"coverFileId"`
	CoverURL           string          `json:"coverUrl" binding:"max=500"`
	SEOTitle           string          `json:"seoTitle" binding:"max=70"`
	SEODescription     string          `json:"seoDescription" binding:"max=170"`
	SortOrder          int             `json:"sortOrder"`
	IsFeatured         *bool           `json:"isFeatured"`
	IsPublished        *bool           `json:"isPublished"`
}
