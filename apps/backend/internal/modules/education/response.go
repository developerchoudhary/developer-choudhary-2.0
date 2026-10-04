package education

import (
	"time"

	"portfolio-backend/internal/shared"
)

type ResponseDTO struct {
	ID          string  `json:"id"`
	Institution string  `json:"institution"`
	Degree      string  `json:"degree"`
	Field       string  `json:"field"`
	Location    string  `json:"location"`
	StartedAt   *string `json:"startedAt"`
	EndedAt     *string `json:"endedAt"`
	Grade       string  `json:"grade"`
	Description string  `json:"description"`
	SortOrder   int     `json:"sortOrder"`
	IsPublished bool    `json:"isPublished"`
	CreatedAt   string  `json:"createdAt"`
	UpdatedAt   string  `json:"updatedAt"`
}

func ToResponse(e *Education) *ResponseDTO {
	if e == nil {
		return nil
	}
	return &ResponseDTO{
		ID:          e.ID.String(),
		Institution: e.Institution,
		Degree:      e.Degree,
		Field:       e.Field,
		Location:    e.Location,
		StartedAt:   shared.FormatDate(e.StartedAt),
		EndedAt:     shared.FormatDate(e.EndedAt),
		Grade:       e.Grade,
		Description: e.Description,
		SortOrder:   e.SortOrder,
		IsPublished: e.IsPublished,
		CreatedAt:   e.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt:   e.UpdatedAt.UTC().Format(time.RFC3339),
	}
}

func ToListResponse(items []*Education) []*ResponseDTO {
	out := make([]*ResponseDTO, 0, len(items))
	for _, it := range items {
		out = append(out, ToResponse(it))
	}
	return out
}
