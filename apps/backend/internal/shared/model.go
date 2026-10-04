package shared

import (
	"time"

	"github.com/google/uuid"
)

type BaseModel struct {
	ID        uuid.UUID `bun:"id,pk"`
	CreatedBy uuid.UUID `bun:"created_by"`
	UpdatedBy uuid.UUID `bun:"updated_by"`
	CreatedAt time.Time `bun:"created_at"`
	UpdatedAt time.Time `bun:"updated_at"`
}

type SoftDeleteModel struct {
	BaseModel `bun:",embed"`
	DeletedBy *uuid.UUID `bun:"deleted_by"`
	DeletedAt *time.Time `bun:"deleted_at"`
}

// Touch stamps audit columns for a new record.
func (m *BaseModel) Touch(userID uuid.UUID) {
	now := time.Now().UTC()
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	if m.CreatedAt.IsZero() {
		m.CreatedAt = now
		m.CreatedBy = userID
	}
	m.UpdatedAt = now
	m.UpdatedBy = userID
}
