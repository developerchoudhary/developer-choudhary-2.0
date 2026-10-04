package auth

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Session struct {
	bun.BaseModel `bun:"table:sessions,alias:sessions"`

	ID               uuid.UUID  `bun:"id,pk"`
	UserID           uuid.UUID  `bun:"user_id,notnull"`
	RefreshTokenHash string     `bun:"refresh_token_hash,notnull"`
	UserAgent        string     `bun:"user_agent"`
	IPAddress        string     `bun:"ip_address"`
	ExpiresAt        time.Time  `bun:"expires_at,notnull"`
	RevokedAt        *time.Time `bun:"revoked_at"`
	LastUsedAt       *time.Time `bun:"last_used_at"`
	CreatedAt        time.Time  `bun:"created_at"`
}
