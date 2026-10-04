package skills

import "github.com/google/uuid"

type RequestDTO struct {
	Name        string  `json:"name" binding:"required,min=1,max=60"`
	Category    string  `json:"category" binding:"required,oneof=frontend backend database devops cloud tools design other"`
	Proficiency int     `json:"proficiency" binding:"gte=0,lte=100"`
	Years       float64 `json:"years" binding:"gte=0,lte=50"`
	Icon        string  `json:"icon" binding:"max=60"`
	Color       string  `json:"color" binding:"max=30"`
	Description string  `json:"description" binding:"max=300"`
	IsFeatured  *bool   `json:"isFeatured"`
	IsPublished *bool   `json:"isPublished"`
	SortOrder   int     `json:"sortOrder"`
}

type ReorderRequest struct {
	IDs []uuid.UUID `json:"ids" binding:"required,min=1"`
}
