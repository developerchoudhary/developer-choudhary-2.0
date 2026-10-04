package leads

import (
	"encoding/json"
	"time"

	"portfolio-backend/internal/shared"
)

type NoteDTO struct {
	ID        string  `json:"id"`
	Body      string  `json:"body"`
	CreatedBy *string `json:"createdBy"`
	CreatedAt string  `json:"createdAt"`
}

type ResponseDTO struct {
	ID               string            `json:"id"`
	FirstName        string            `json:"firstName"`
	LastName         string            `json:"lastName"`
	Email            string            `json:"email"`
	Phone            string            `json:"phone"`
	Company          string            `json:"company"`
	Website          string            `json:"website"`
	ServiceInterest  string            `json:"serviceInterest"`
	ProjectType      string            `json:"projectType"`
	BudgetRange      string            `json:"budgetRange"`
	Timeline         string            `json:"timeline"`
	Message          string            `json:"message"`
	SourcePage       string            `json:"sourcePage"`
	Referrer         string            `json:"referrer"`
	UTM              map[string]string `json:"utm"`
	ConsentLocation  bool              `json:"consentLocation"`
	Latitude         *float64          `json:"latitude"`
	Longitude        *float64          `json:"longitude"`
	LocationAccuracy *float64          `json:"locationAccuracy"`
	City             string            `json:"city"`
	Region           string            `json:"region"`
	Country          string            `json:"country"`
	Timezone         string            `json:"timezone"`
	IPAddress        string            `json:"ipAddress"`
	UserAgent        string            `json:"userAgent"`
	Status           string            `json:"status"`
	Priority         string            `json:"priority"`
	NotifiedAt       *string           `json:"notifiedAt"`
	ContactedAt      *string           `json:"contactedAt"`
	ClosedAt         *string           `json:"closedAt"`
	Notes            []NoteDTO         `json:"notes,omitempty"`
	CreatedAt        string            `json:"createdAt"`
	UpdatedAt        string            `json:"updatedAt"`
}

type StatsDTO struct {
	Total     int            `json:"total"`
	Last7Days int            `json:"last7Days"`
	ByStatus  map[string]int `json:"byStatus"`
}

func ToNote(n *Note) NoteDTO {
	var by *string
	if n.CreatedBy != nil {
		s := n.CreatedBy.String()
		by = &s
	}
	return NoteDTO{ID: n.ID.String(), Body: n.Body, CreatedBy: by, CreatedAt: n.CreatedAt.UTC().Format(time.RFC3339)}
}

func ToResponse(l *Lead, withNotes bool) *ResponseDTO {
	if l == nil {
		return nil
	}
	utm := map[string]string{}
	if len(l.UTM) > 0 {
		_ = json.Unmarshal(l.UTM, &utm)
	}
	dto := &ResponseDTO{
		ID:               l.ID.String(),
		FirstName:        l.FirstName,
		LastName:         l.LastName,
		Email:            l.Email,
		Phone:            l.Phone,
		Company:          l.Company,
		Website:          l.Website,
		ServiceInterest:  l.ServiceInterest,
		ProjectType:      l.ProjectType,
		BudgetRange:      l.BudgetRange,
		Timeline:         l.Timeline,
		Message:          l.Message,
		SourcePage:       l.SourcePage,
		Referrer:         l.Referrer,
		UTM:              utm,
		ConsentLocation:  l.ConsentLocation,
		Latitude:         l.Latitude,
		Longitude:        l.Longitude,
		LocationAccuracy: l.LocationAccuracy,
		City:             l.City,
		Region:           l.Region,
		Country:          l.Country,
		Timezone:         l.Timezone,
		IPAddress:        l.IPAddress,
		UserAgent:        l.UserAgent,
		Status:           l.Status,
		Priority:         l.Priority,
		NotifiedAt:       shared.FormatTime(l.NotifiedAt),
		ContactedAt:      shared.FormatTime(l.ContactedAt),
		ClosedAt:         shared.FormatTime(l.ClosedAt),
		CreatedAt:        l.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt:        l.UpdatedAt.UTC().Format(time.RFC3339),
	}
	if withNotes {
		dto.Notes = make([]NoteDTO, 0, len(l.Notes))
		for _, n := range l.Notes {
			dto.Notes = append(dto.Notes, ToNote(n))
		}
	}
	return dto
}

func ToListResponse(items []*Lead) []*ResponseDTO {
	out := make([]*ResponseDTO, 0, len(items))
	for _, it := range items {
		out = append(out, ToResponse(it, false))
	}
	return out
}
