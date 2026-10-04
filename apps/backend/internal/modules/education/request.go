package education

type RequestDTO struct {
	Institution string  `json:"institution" binding:"required,min=2,max=160"`
	Degree      string  `json:"degree" binding:"required,min=2,max=120"`
	Field       string  `json:"field" binding:"max=120"`
	Location    string  `json:"location" binding:"max=120"`
	StartedAt   *string `json:"startedAt"`
	EndedAt     *string `json:"endedAt"`
	Grade       string  `json:"grade" binding:"max=60"`
	Description string  `json:"description" binding:"max=1500"`
	SortOrder   int     `json:"sortOrder"`
	IsPublished *bool   `json:"isPublished"`
}
