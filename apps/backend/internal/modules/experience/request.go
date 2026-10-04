package experience

type RequestDTO struct {
	Company          string   `json:"company" binding:"required,min=2,max=120"`
	CompanyURL       string   `json:"companyUrl" binding:"omitempty,url,max=300"`
	Role             string   `json:"role" binding:"required,min=2,max=120"`
	EmploymentType   string   `json:"employmentType" binding:"required,oneof=full-time part-time freelance contract internship"`
	Location         string   `json:"location" binding:"max=120"`
	IsRemote         bool     `json:"isRemote"`
	StartedAt        string   `json:"startedAt" binding:"required"`
	EndedAt          *string  `json:"endedAt"`
	IsCurrent        bool     `json:"isCurrent"`
	Summary          string   `json:"summary" binding:"max=2000"`
	Responsibilities []string `json:"responsibilities" binding:"max=30,dive,max=500"`
	Achievements     []string `json:"achievements" binding:"max=30,dive,max=500"`
	Technologies     []string `json:"technologies" binding:"max=40,dive,max=60"`
	SortOrder        int      `json:"sortOrder"`
	IsPublished      *bool    `json:"isPublished"`
}
