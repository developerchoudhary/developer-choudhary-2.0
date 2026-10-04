package projects

import (
	"encoding/json"
)

type RequestDTO struct {
	Slug           string          `json:"slug" binding:"max=96"`
	Title          string          `json:"title" binding:"required,min=2,max=140"`
	Subtitle       string          `json:"subtitle" binding:"max=200"`
	Summary        string          `json:"summary" binding:"max=1200"`
	Description    json.RawMessage `json:"description"`
	ClientName     string          `json:"clientName" binding:"max=120"`
	ClientIndustry string          `json:"clientIndustry" binding:"max=120"`
	ProjectType    string          `json:"projectType" binding:"required,oneof=website erp crm web-app ecommerce api mobile devops other"`
	Status         string          `json:"status" binding:"omitempty,oneof=upcoming in-progress completed"`
	LiveURL        string          `json:"liveUrl" binding:"omitempty,url,max=400"`
	RepoURL        string          `json:"repoUrl" binding:"omitempty,url,max=400"`
	CoverFileID    *string         `json:"coverFileId"`
	CoverURL       string          `json:"coverUrl" binding:"max=500"`
	Gallery        []GalleryItem   `json:"gallery" binding:"max=24,dive"`
	Technologies   []string        `json:"technologies" binding:"max=40,dive,max=60"`
	ServiceSlugs   []string        `json:"serviceSlugs" binding:"max=10,dive,max=96"`
	Highlights     []Highlight     `json:"highlights" binding:"max=8,dive"`
	Role           string          `json:"role" binding:"max=120"`
	StartedAt      *string         `json:"startedAt"`
	CompletedAt    *string         `json:"completedAt"`
	IsFeatured     *bool           `json:"isFeatured"`
	IsPublished    *bool           `json:"isPublished"`
	SortOrder      int             `json:"sortOrder"`
	SEOTitle       string          `json:"seoTitle" binding:"max=70"`
	SEODescription string          `json:"seoDescription" binding:"max=170"`
}
