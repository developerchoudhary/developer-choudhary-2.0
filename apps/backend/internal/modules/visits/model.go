package visits

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Visit struct {
	bun.BaseModel `bun:"table:visits,alias:visits"`

	ID               uuid.UUID `bun:"id,pk"`
	VisitorID        string    `bun:"visitor_id"`
	SessionID        string    `bun:"session_id"`
	Path             string    `bun:"path,notnull"`
	Referrer         string    `bun:"referrer"`
	UserAgent        string    `bun:"user_agent"`
	Device           string    `bun:"device"`
	IPHash           string    `bun:"ip_hash"`
	Country          string    `bun:"country"`
	Region           string    `bun:"region"`
	City             string    `bun:"city"`
	Timezone         string    `bun:"timezone"`
	Latitude         *float64  `bun:"latitude"`
	Longitude        *float64  `bun:"longitude"`
	LocationAccuracy *float64  `bun:"location_accuracy"`
	ConsentLocation  bool      `bun:"consent_location"`
	DurationMs       *int      `bun:"duration_ms"`
	CreatedAt        time.Time `bun:"created_at"`
}
