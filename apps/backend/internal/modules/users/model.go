package users

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type User struct {
	bun.BaseModel `bun:"table:users,alias:users"`

	ID           uuid.UUID  `bun:"id,pk"`
	Email        string     `bun:"email,notnull"`
	PasswordHash string     `bun:"password_hash,notnull"`
	Name         string     `bun:"name,notnull"`
	Role         string     `bun:"role,notnull"`
	IsActive     bool       `bun:"is_active,notnull"`
	LastLoginAt  *time.Time `bun:"last_login_at"`
	CreatedBy    *uuid.UUID `bun:"created_by"`
	UpdatedBy    *uuid.UUID `bun:"updated_by"`
	CreatedAt    time.Time  `bun:"created_at"`
	UpdatedAt    time.Time  `bun:"updated_at"`
}
