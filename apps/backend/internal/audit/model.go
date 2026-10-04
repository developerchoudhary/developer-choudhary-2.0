package audit

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

// Action represents the type of database operation.
type Action string

const (
	ActionCreate Action = "CREATE"
	ActionUpdate Action = "UPDATE"
	ActionDelete Action = "DELETE"
	ActionLogin  Action = "LOGIN"
)

// Log represents a single audit log entry.
type Log struct {
	bun.BaseModel `bun:"table:audit_logs,alias:audit_logs"`

	ID          uuid.UUID       `bun:"id,pk,default:uuid_generate_v4()"`
	Action      Action          `bun:"action,notnull"`
	Changes     json.RawMessage `bun:"changes,notnull,type:jsonb"`
	EntityID    uuid.UUID       `bun:"entity_id,notnull"`
	EntityName  string          `bun:"entity_name,notnull"`
	IPAddress   string          `bun:"ip_address,notnull"`
	PerformedBy *string         `bun:"performed_by"`
	Timestamp   time.Time       `bun:"timestamp,notnull,default:now()"`
}
