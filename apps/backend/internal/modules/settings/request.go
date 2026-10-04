package settings

import "encoding/json"

type Item struct {
	Key         string          `json:"key" binding:"required,max=120"`
	Value       json.RawMessage `json:"value" binding:"required"`
	IsPublic    *bool           `json:"isPublic"`
	Description string          `json:"description" binding:"max=300"`
}

type BulkUpdateRequest struct {
	Items []Item `json:"items" binding:"required,min=1,dive"`
}
