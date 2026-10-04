package taglines

import "github.com/google/uuid"

type RequestDTO struct {
	Text      string `json:"text" binding:"required,min=2,max=200"`
	Context   string `json:"context" binding:"required,oneof=hero cta footer about"`
	SortOrder int    `json:"sortOrder"`
	IsActive  *bool  `json:"isActive"`
}

type ReorderRequest struct {
	IDs []uuid.UUID `json:"ids" binding:"required,min=1"`
}
