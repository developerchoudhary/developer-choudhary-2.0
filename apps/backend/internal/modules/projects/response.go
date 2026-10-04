package projects

import (
	"encoding/json"
	"time"

	"portfolio-backend/internal/shared"
)

type ResponseDTO struct {
	ID             string          `json:"id"`
	Slug           string          `json:"slug"`
	Title          string          `json:"title"`
	Subtitle       string          `json:"subtitle"`
	Summary        string          `json:"summary"`
	Description    json.RawMessage `json:"description,omitempty"`
	ClientName     string          `json:"clientName"`
	ClientIndustry string          `json:"clientIndustry"`
	ProjectType    string          `json:"projectType"`
	LiveURL        string          `json:"liveUrl"`
	RepoURL        string          `json:"repoUrl"`
	CoverFileID    *string         `json:"coverFileId"`
	CoverURL       string          `json:"coverUrl"`
	Gallery        []GalleryItem   `json:"gallery"`
	Technologies   []string        `json:"technologies"`
	ServiceSlugs   []string        `json:"serviceSlugs"`
	Highlights     []Highlight     `json:"highlights"`
	Role           string          `json:"role"`
	StartedAt      *string         `json:"startedAt"`
	CompletedAt    *string         `json:"completedAt"`
	IsFeatured     bool            `json:"isFeatured"`
	IsPublished    bool            `json:"isPublished"`
	SortOrder      int             `json:"sortOrder"`
	SEOTitle       string          `json:"seoTitle"`
	SEODescription string          `json:"seoDescription"`
	CreatedAt      string          `json:"createdAt"`
	UpdatedAt      string          `json:"updatedAt"`
}

// ToResponse maps a project. When full is false the heavy description blocks are omitted (list views).
func ToResponse(p *Project, full bool) *ResponseDTO {
	if p == nil {
		return nil
	}
	gallery := []GalleryItem{}
	if len(p.Gallery) > 0 {
		_ = json.Unmarshal(p.Gallery, &gallery)
	}
	highlights := []Highlight{}
	if len(p.Highlights) > 0 {
		_ = json.Unmarshal(p.Highlights, &highlights)
	}
	dto := &ResponseDTO{
		ID:             p.ID.String(),
		Slug:           p.Slug,
		Title:          p.Title,
		Subtitle:       p.Subtitle,
		Summary:        p.Summary,
		ClientName:     p.ClientName,
		ClientIndustry: p.ClientIndustry,
		ProjectType:    p.ProjectType,
		LiveURL:        p.LiveURL,
		RepoURL:        p.RepoURL,
		CoverFileID:    p.CoverFileID,
		CoverURL:       p.CoverURL,
		Gallery:        gallery,
		Technologies:   orEmpty(p.Technologies),
		ServiceSlugs:   orEmpty(p.ServiceSlugs),
		Highlights:     highlights,
		Role:           p.Role,
		StartedAt:      shared.FormatDate(p.StartedAt),
		CompletedAt:    shared.FormatDate(p.CompletedAt),
		IsFeatured:     p.IsFeatured,
		IsPublished:    p.IsPublished,
		SortOrder:      p.SortOrder,
		SEOTitle:       p.SEOTitle,
		SEODescription: p.SEODescription,
		CreatedAt:      p.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt:      p.UpdatedAt.UTC().Format(time.RFC3339),
	}
	if full {
		dto.Description = p.Description
		if len(dto.Description) == 0 {
			dto.Description = json.RawMessage("[]")
		}
	}
	return dto
}

func ToListResponse(items []*Project) []*ResponseDTO {
	out := make([]*ResponseDTO, 0, len(items))
	for _, it := range items {
		out = append(out, ToResponse(it, false))
	}
	return out
}

func orEmpty(v []string) []string {
	if v == nil {
		return []string{}
	}
	return v
}
