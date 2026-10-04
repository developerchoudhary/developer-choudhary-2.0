package settings

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

// Setting is a stored value for a key in the Registry.
type Setting struct {
	bun.BaseModel `bun:"table:settings,alias:settings"`

	Key       string          `bun:"key,pk"`
	Value     json.RawMessage `bun:"value,type:jsonb,notnull"`
	UpdatedBy *uuid.UUID      `bun:"updated_by"`
	UpdatedAt time.Time       `bun:"updated_at"`
}
