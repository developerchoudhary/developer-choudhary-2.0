package reviews

import (
	"time"

	"portfolio-backend/internal/shared"
)

type ResponseDTO struct {
	ID                 string  `json:"id"`
	AuthorName         string  `json:"authorName"`
	AuthorRole         string  `json:"authorRole"`
	AuthorCompany      string  `json:"authorCompany"`
	AuthorEmail        string  `json:"authorEmail,omitempty"`
	AuthorAvatarFileID *string `json:"authorAvatarFileId,omitempty"`
	AuthorAvatarURL    string  `json:"authorAvatarUrl"`
	Rating             int     `json:"rating"`
	Title              string  `json:"title"`
	Body               string  `json:"body"`
	ServiceSlug        string  `json:"serviceSlug"`
	Source             string  `json:"source"`
	Status             string  `json:"status,omitempty"`
	IsFeatured         bool    `json:"isFeatured"`
	ReviewedAt         *string `json:"reviewedAt"`
	ApprovedAt         *string `json:"approvedAt,omitempty"`
	CreatedAt          string  `json:"createdAt"`
	UpdatedAt          string  `json:"updatedAt,omitempty"`
}

type SummaryDTO struct {
	Average      float64        `json:"average"`
	Count        int            `json:"count"`
	Distribution map[string]int `json:"distribution"`
}

func ToResponse(r *Review, admin bool) *ResponseDTO {
	if r == nil {
		return nil
	}
	dto := &ResponseDTO{
		ID:              r.ID.String(),
		AuthorName:      r.AuthorName,
		AuthorRole:      r.AuthorRole,
		AuthorCompany:   r.AuthorCompany,
		AuthorAvatarURL: r.AuthorAvatarURL,
		Rating:          int(r.Rating),
		Title:           r.Title,
		Body:            r.Body,
		ServiceSlug:     r.ServiceSlug,
		Source:          r.Source,
		IsFeatured:      r.IsFeatured,
		ReviewedAt:      shared.FormatDate(r.ReviewedAt),
		CreatedAt:       r.CreatedAt.UTC().Format(time.RFC3339),
	}
	if admin {
		dto.AuthorEmail = r.AuthorEmail
		dto.AuthorAvatarFileID = r.AuthorAvatarFileID
		dto.Status = r.Status
		dto.ApprovedAt = shared.FormatTime(r.ApprovedAt)
		dto.UpdatedAt = r.UpdatedAt.UTC().Format(time.RFC3339)
	}
	return dto
}

func ToListResponse(items []*Review, admin bool) []*ResponseDTO {
	out := make([]*ResponseDTO, 0, len(items))
	for _, it := range items {
		out = append(out, ToResponse(it, admin))
	}
	return out
}
