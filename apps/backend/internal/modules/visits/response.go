package visits

import "time"

type ResponseDTO struct {
	ID              string   `json:"id"`
	VisitorID       string   `json:"visitorId"`
	Path            string   `json:"path"`
	Referrer        string   `json:"referrer"`
	Device          string   `json:"device"`
	Country         string   `json:"country"`
	Region          string   `json:"region"`
	City            string   `json:"city"`
	Latitude        *float64 `json:"latitude"`
	Longitude       *float64 `json:"longitude"`
	ConsentLocation bool     `json:"consentLocation"`
	DurationMs      *int     `json:"durationMs"`
	CreatedAt       string   `json:"createdAt"`
}

type CountDTO struct {
	Label string `json:"label" bun:"label"`
	Count int    `json:"count" bun:"count"`
}

type DayDTO struct {
	Day      string `json:"day" bun:"day"`
	Views    int    `json:"views" bun:"views"`
	Visitors int    `json:"visitors" bun:"visitors"`
}

type PointDTO struct {
	Latitude  float64 `json:"latitude" bun:"latitude"`
	Longitude float64 `json:"longitude" bun:"longitude"`
	City      string  `json:"city" bun:"city"`
	Country   string  `json:"country" bun:"country"`
	Count     int     `json:"count" bun:"count"`
}

type HourDTO struct {
	Hour  int `json:"hour" bun:"hour"`
	Views int `json:"views" bun:"views"`
}

// StatsDTO summarises traffic for the requested window (RangeDays) and compares it with the window before it.
type StatsDTO struct {
	RangeDays      int        `json:"rangeDays"`
	Views          int        `json:"views"`
	Visitors       int        `json:"visitors"`
	PrevViews      int        `json:"prevViews"`
	PrevVisitors   int        `json:"prevVisitors"`
	ViewsToday     int        `json:"viewsToday"`
	VisitorsToday  int        `json:"visitorsToday"`
	ConsentRate    float64    `json:"consentRate"`
	AvgDurationMs  int        `json:"avgDurationMs"`
	TopPages       []CountDTO `json:"topPages"`
	TopCountries   []CountDTO `json:"topCountries"`
	TopCities      []CountDTO `json:"topCities"`
	TopReferrers   []CountDTO `json:"topReferrers"`
	Devices        []CountDTO `json:"devices"`
	Daily          []DayDTO   `json:"daily"`
	Hourly         []HourDTO  `json:"hourly"`
	LocationPoints []PointDTO `json:"locationPoints"`
}

func ToResponse(v *Visit) *ResponseDTO {
	return &ResponseDTO{
		ID:              v.ID.String(),
		VisitorID:       v.VisitorID,
		Path:            v.Path,
		Referrer:        v.Referrer,
		Device:          v.Device,
		Country:         v.Country,
		Region:          v.Region,
		City:            v.City,
		Latitude:        v.Latitude,
		Longitude:       v.Longitude,
		ConsentLocation: v.ConsentLocation,
		DurationMs:      v.DurationMs,
		CreatedAt:       v.CreatedAt.UTC().Format(time.RFC3339),
	}
}

func ToListResponse(items []*Visit) []*ResponseDTO {
	out := make([]*ResponseDTO, 0, len(items))
	for _, it := range items {
		out = append(out, ToResponse(it))
	}
	return out
}
