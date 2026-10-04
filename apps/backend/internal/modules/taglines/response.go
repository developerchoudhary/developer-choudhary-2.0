package taglines

import "time"

type ResponseDTO struct {
	ID        string `json:"id"`
	Text      string `json:"text"`
	Context   string `json:"context"`
	SortOrder int    `json:"sortOrder"`
	IsActive  bool   `json:"isActive"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

func ToResponse(t *Tagline) *ResponseDTO {
	if t == nil {
		return nil
	}
	return &ResponseDTO{
		ID:        t.ID.String(),
		Text:      t.Text,
		Context:   t.Context,
		SortOrder: t.SortOrder,
		IsActive:  t.IsActive,
		CreatedAt: t.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt: t.UpdatedAt.UTC().Format(time.RFC3339),
	}
}

func ToListResponse(items []*Tagline) []*ResponseDTO {
	out := make([]*ResponseDTO, 0, len(items))
	for _, it := range items {
		out = append(out, ToResponse(it))
	}
	return out
}

// PublicDTO is the compact shape used by the site bundle.
type PublicDTO struct {
	ID      string `json:"id"`
	Text    string `json:"text"`
	Context string `json:"context"`
}

func ToPublicList(items []*Tagline) []PublicDTO {
	out := make([]PublicDTO, 0, len(items))
	for _, it := range items {
		out = append(out, PublicDTO{ID: it.ID.String(), Text: it.Text, Context: it.Context})
	}
	return out
}
