package audit

import (
	"context"
)

type contextKey string

const (
	keyUserID    contextKey = "audit:user_id"
	keyIPAddr    contextKey = "audit:ip_address"
	keySkipAudit contextKey = "audit:skip"
)

// WithUserID returns a context with the performing user's ID set.
func WithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, keyUserID, userID)
}

// WithIPAddress returns a context with the client IP address set.
func WithIPAddress(ctx context.Context, ip string) context.Context {
	return context.WithValue(ctx, keyIPAddr, ip)
}

// WithSkipAudit returns a context that skips audit logging (e.g. for system jobs).
func WithSkipAudit(ctx context.Context) context.Context {
	return context.WithValue(ctx, keySkipAudit, true)
}

// GetUserID returns the user ID from context, or empty string if not set.
func GetUserID(ctx context.Context) string {
	if v, ok := ctx.Value(keyUserID).(string); ok {
		return v
	}
	return ""
}

// GetIPAddress returns the client IP from context, or "system" for non-HTTP requests.
func GetIPAddress(ctx context.Context) string {
	if v, ok := ctx.Value(keyIPAddr).(string); ok {
		return v
	}
	return "system"
}

// ShouldSkipAudit returns true if audit logging should be skipped for this context.
func ShouldSkipAudit(ctx context.Context) bool {
	if v, ok := ctx.Value(keySkipAudit).(bool); ok {
		return v
	}
	return false
}
