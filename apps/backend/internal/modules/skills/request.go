package skills

type RequestDTO struct {
	Name        string `json:"name" binding:"required,min=1,max=60"`
	Category    string `json:"category" binding:"required,oneof=frontend backend database devops cloud tools design other"`
	IsFeatured  *bool  `json:"isFeatured"`
	IsPublished *bool  `json:"isPublished"`
	SortOrder   int    `json:"sortOrder"`
}
