package visits

type TrackRequest struct {
	VisitorID       string   `json:"visitorId" binding:"max=64"`
	SessionID       string   `json:"sessionId" binding:"max=64"`
	Path            string   `json:"path" binding:"required,max=300"`
	Referrer        string   `json:"referrer" binding:"max=500"`
	Device          string   `json:"device" binding:"omitempty,oneof=mobile tablet desktop"`
	Timezone        string   `json:"timezone" binding:"max=64"`
	ConsentLocation bool     `json:"consentLocation"`
	Latitude        *float64 `json:"latitude" binding:"omitempty,gte=-90,lte=90"`
	Longitude       *float64 `json:"longitude" binding:"omitempty,gte=-180,lte=180"`
	Accuracy        *float64 `json:"accuracy" binding:"omitempty,gte=0"`
	City            string   `json:"city" binding:"max=120"`
	Region          string   `json:"region" binding:"max=120"`
	Country         string   `json:"country" binding:"max=120"`
	DurationMs      *int     `json:"durationMs" binding:"omitempty,gte=0,lte=86400000"`
}
