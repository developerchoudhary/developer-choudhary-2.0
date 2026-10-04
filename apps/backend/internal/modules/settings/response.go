package settings

import (
	"encoding/json"
	"time"
)

type ResponseDTO struct {
	Key         string          `json:"key"`
	Value       json.RawMessage `json:"value"`
	IsPublic    bool            `json:"isPublic"`
	Description string          `json:"description"`
	UpdatedAt   string          `json:"updatedAt"`
}

func ToResponse(s *Setting) *ResponseDTO {
	return &ResponseDTO{
		Key:         s.Key,
		Value:       s.Value,
		IsPublic:    s.IsPublic,
		Description: s.Description,
		UpdatedAt:   s.UpdatedAt.UTC().Format(time.RFC3339),
	}
}

func ToListResponse(items []*Setting) []*ResponseDTO {
	out := make([]*ResponseDTO, 0, len(items))
	for _, it := range items {
		out = append(out, ToResponse(it))
	}
	return out
}

// ToMap flattens settings into {key: value} for the public site bundle.
func ToMap(items []*Setting) map[string]json.RawMessage {
	out := make(map[string]json.RawMessage, len(items))
	for _, it := range items {
		out[it.Key] = it.Value
	}
	return out
}
