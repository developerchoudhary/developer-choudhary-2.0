package settings

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Setting struct {
	bun.BaseModel `bun:"table:settings,alias:settings"`

	Key         string          `bun:"key,pk"`
	Value       json.RawMessage `bun:"value,type:jsonb,notnull"`
	IsPublic    bool            `bun:"is_public,notnull"`
	Description string          `bun:"description"`
	UpdatedBy   *uuid.UUID      `bun:"updated_by"`
	UpdatedAt   time.Time       `bun:"updated_at"`
}
