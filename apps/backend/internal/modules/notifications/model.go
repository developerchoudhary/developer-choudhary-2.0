package notifications

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

const (
	StatusPending = "pending"
	StatusSending = "sending"
	StatusSent    = "sent"
	StatusFailed  = "failed"
)

type Outbox struct {
	bun.BaseModel `bun:"table:email_outbox,alias:email_outbox"`

	ID            uuid.UUID  `bun:"id,pk"`
	ToEmail       string     `bun:"to_email,notnull"`
	ReplyTo       string     `bun:"reply_to"`
	Subject       string     `bun:"subject,notnull"`
	HTMLBody      string     `bun:"html_body,notnull"`
	TextBody      string     `bun:"text_body"`
	Template      string     `bun:"template"`
	EntityName    string     `bun:"entity_name"`
	EntityID      *uuid.UUID `bun:"entity_id"`
	Status        string     `bun:"status,notnull"`
	Attempts      int        `bun:"attempts"`
	MaxAttempts   int        `bun:"max_attempts"`
	LastError     string     `bun:"last_error"`
	NextAttemptAt time.Time  `bun:"next_attempt_at"`
	SentAt        *time.Time `bun:"sent_at"`
	CreatedAt     time.Time  `bun:"created_at"`
	UpdatedAt     time.Time  `bun:"updated_at"`
}

type StatsDTO struct {
	Pending int `json:"pending"`
	Failed  int `json:"failed"`
	Sent24h int `json:"sent24h"`
}
