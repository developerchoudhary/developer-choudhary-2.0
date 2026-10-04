package experience

import (
	"time"

	"portfolio-backend/internal/shared"
)

type ResponseDTO struct {
	ID               string   `json:"id"`
	Company          string   `json:"company"`
	CompanyURL       string   `json:"companyUrl"`
	Role             string   `json:"role"`
	EmploymentType   string   `json:"employmentType"`
	Location         string   `json:"location"`
	IsRemote         bool     `json:"isRemote"`
	StartedAt        string   `json:"startedAt"`
	EndedAt          *string  `json:"endedAt"`
	IsCurrent        bool     `json:"isCurrent"`
	Summary          string   `json:"summary"`
	Responsibilities []string `json:"responsibilities"`
	Achievements     []string `json:"achievements"`
	Technologies     []string `json:"technologies"`
	SortOrder        int      `json:"sortOrder"`
	IsPublished      bool     `json:"isPublished"`
	CreatedAt        string   `json:"createdAt"`
	UpdatedAt        string   `json:"updatedAt"`
}

func ToResponse(e *Experience) *ResponseDTO {
	if e == nil {
		return nil
	}
	return &ResponseDTO{
		ID:               e.ID.String(),
		Company:          e.Company,
		CompanyURL:       e.CompanyURL,
		Role:             e.Role,
		EmploymentType:   e.EmploymentType,
		Location:         e.Location,
		IsRemote:         e.IsRemote,
		StartedAt:        e.StartedAt.Format("2006-01-02"),
		EndedAt:          shared.FormatDate(e.EndedAt),
		IsCurrent:        e.IsCurrent,
		Summary:          e.Summary,
		Responsibilities: orEmpty(e.Responsibilities),
		Achievements:     orEmpty(e.Achievements),
		Technologies:     orEmpty(e.Technologies),
		SortOrder:        e.SortOrder,
		IsPublished:      e.IsPublished,
		CreatedAt:        e.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt:        e.UpdatedAt.UTC().Format(time.RFC3339),
	}
}

func ToListResponse(items []*Experience) []*ResponseDTO {
	out := make([]*ResponseDTO, 0, len(items))
	for _, it := range items {
		out = append(out, ToResponse(it))
	}
	return out
}

func orEmpty(v []string) []string {
	if v == nil {
		return []string{}
	}
	return v
}
