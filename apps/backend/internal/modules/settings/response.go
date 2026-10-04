package settings

import "encoding/json"

// FieldDTO is one setting with its definition and current value, for the admin form.
type FieldDTO struct {
	Definition
	Value     json.RawMessage `json:"value"`
	UpdatedAt *string         `json:"updatedAt"`
}

type GroupDTO struct {
	Key         string     `json:"key"`
	Label       string     `json:"label"`
	Description string     `json:"description"`
	Items       []FieldDTO `json:"items"`
}
