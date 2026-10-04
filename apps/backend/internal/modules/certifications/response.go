package certifications

import (
	"time"

	"portfolio-backend/internal/shared"
)

type ResponseDTO struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	Issuer        string  `json:"issuer"`
	IssuedAt      *string `json:"issuedAt"`
	ExpiresAt     *string `json:"expiresAt"`
	CredentialID  string  `json:"credentialId"`
	CredentialURL string  `json:"credentialUrl"`
	SortOrder     int     `json:"sortOrder"`
	IsPublished   bool    `json:"isPublished"`
	CreatedAt     string  `json:"createdAt"`
	UpdatedAt     string  `json:"updatedAt"`
}

func ToResponse(c *Certification) *ResponseDTO {
	if c == nil {
		return nil
	}
	return &ResponseDTO{
		ID:            c.ID.String(),
		Name:          c.Name,
		Issuer:        c.Issuer,
		IssuedAt:      shared.FormatDate(c.IssuedAt),
		ExpiresAt:     shared.FormatDate(c.ExpiresAt),
		CredentialID:  c.CredentialID,
		CredentialURL: c.CredentialURL,
		SortOrder:     c.SortOrder,
		IsPublished:   c.IsPublished,
		CreatedAt:     c.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt:     c.UpdatedAt.UTC().Format(time.RFC3339),
	}
}

func ToListResponse(items []*Certification) []*ResponseDTO {
	out := make([]*ResponseDTO, 0, len(items))
	for _, it := range items {
		out = append(out, ToResponse(it))
	}
	return out
}
