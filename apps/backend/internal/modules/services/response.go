package services

import (
	"encoding/json"
	"time"
)

type ResponseDTO struct {
	ID                 string          `json:"id"`
	Slug               string          `json:"slug"`
	Title              string          `json:"title"`
	Tagline            string          `json:"tagline"`
	Summary            string          `json:"summary"`
	Description        json.RawMessage `json:"description"`
	Icon               string          `json:"icon"`
	Deliverables       []string        `json:"deliverables"`
	TechStack          []string        `json:"techStack"`
	IdealFor           []string        `json:"idealFor"`
	StartingPriceLabel string          `json:"startingPriceLabel"`
	TimelineLabel      string          `json:"timelineLabel"`
	FAQs               []FAQ           `json:"faqs"`
	CoverFileID        *string         `json:"coverFileId"`
	CoverURL           string          `json:"coverUrl"`
	SEOTitle           string          `json:"seoTitle"`
	SEODescription     string          `json:"seoDescription"`
	SortOrder          int             `json:"sortOrder"`
	IsFeatured         bool            `json:"isFeatured"`
	IsPublished        bool            `json:"isPublished"`
	CreatedAt          string          `json:"createdAt"`
	UpdatedAt          string          `json:"updatedAt"`
}

func ToResponse(s *Service) *ResponseDTO {
	if s == nil {
		return nil
	}
	faqs := []FAQ{}
	if len(s.FAQs) > 0 {
		_ = json.Unmarshal(s.FAQs, &faqs)
	}
	desc := s.Description
	if len(desc) == 0 {
		desc = json.RawMessage("[]")
	}
	return &ResponseDTO{
		ID:                 s.ID.String(),
		Slug:               s.Slug,
		Title:              s.Title,
		Tagline:            s.Tagline,
		Summary:            s.Summary,
		Description:        desc,
		Icon:               s.Icon,
		Deliverables:       orEmpty(s.Deliverables),
		TechStack:          orEmpty(s.TechStack),
		IdealFor:           orEmpty(s.IdealFor),
		StartingPriceLabel: s.StartingPriceLabel,
		TimelineLabel:      s.TimelineLabel,
		FAQs:               faqs,
		CoverFileID:        s.CoverFileID,
		CoverURL:           s.CoverURL,
		SEOTitle:           s.SEOTitle,
		SEODescription:     s.SEODescription,
		SortOrder:          s.SortOrder,
		IsFeatured:         s.IsFeatured,
		IsPublished:        s.IsPublished,
		CreatedAt:          s.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt:          s.UpdatedAt.UTC().Format(time.RFC3339),
	}
}

func ToListResponse(items []*Service) []*ResponseDTO {
	out := make([]*ResponseDTO, 0, len(items))
	for _, it := range items {
		out = append(out, ToResponse(it))
	}
	return out
}

func orEmpty(v []string) []string {
	if v == nil {
		return []string{}
	}
	return v
}
