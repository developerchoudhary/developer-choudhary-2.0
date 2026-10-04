package leads

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

var Statuses = []string{"new", "contacted", "qualified", "proposal", "won", "lost", "spam"}

type Lead struct {
	bun.BaseModel `bun:"table:leads,alias:leads"`

	ID               uuid.UUID       `bun:"id,pk"`
	FirstName        string          `bun:"first_name,notnull"`
	LastName         string          `bun:"last_name"`
	Email            string          `bun:"email"`
	Phone            string          `bun:"phone"`
	Company          string          `bun:"company"`
	Website          string          `bun:"website"`
	ServiceInterest  string          `bun:"service_interest"`
	ProjectType      string          `bun:"project_type"`
	BudgetRange      string          `bun:"budget_range"`
	Timeline         string          `bun:"timeline"`
	Message          string          `bun:"message,notnull"`
	SourcePage       string          `bun:"source_page"`
	Referrer         string          `bun:"referrer"`
	UTM              json.RawMessage `bun:"utm,type:jsonb"`
	ConsentLocation  bool            `bun:"consent_location"`
	Latitude         *float64        `bun:"latitude"`
	Longitude        *float64        `bun:"longitude"`
	LocationAccuracy *float64        `bun:"location_accuracy"`
	City             string          `bun:"city"`
	Region           string          `bun:"region"`
	Country          string          `bun:"country"`
	Timezone         string          `bun:"timezone"`
	IPAddress        string          `bun:"ip_address"`
	UserAgent        string          `bun:"user_agent"`
	Status           string          `bun:"status,notnull"`
	Priority         string          `bun:"priority,notnull"`
	IsSpam           bool            `bun:"is_spam"`
	NotifiedAt       *time.Time      `bun:"notified_at"`
	ContactedAt      *time.Time      `bun:"contacted_at"`
	ClosedAt         *time.Time      `bun:"closed_at"`
	UpdatedBy        *uuid.UUID      `bun:"updated_by"`
	DeletedBy        *uuid.UUID      `bun:"deleted_by"`
	DeletedAt        *time.Time      `bun:"deleted_at"`
	CreatedAt        time.Time       `bun:"created_at"`
	UpdatedAt        time.Time       `bun:"updated_at"`

	Notes []*Note `bun:"rel:has-many,join:id=lead_id"`
}

type Note struct {
	bun.BaseModel `bun:"table:lead_notes,alias:lead_notes"`

	ID        uuid.UUID  `bun:"id,pk"`
	LeadID    uuid.UUID  `bun:"lead_id,notnull"`
	Body      string     `bun:"body,notnull"`
	CreatedBy *uuid.UUID `bun:"created_by"`
	CreatedAt time.Time  `bun:"created_at"`
}
