package authz

import (
	"context"
	"errors"
	"strings"
)

// PermissionAll is the wildcard permission granted to the admin role.
const PermissionAll = "*"

const (
	RoleAdmin  = "admin"
	RoleEditor = "editor"
)

var ErrAccessDenied = errors.New("access denied")

type contextKey struct{}

type AuthContext struct {
	UserID      string
	SessionID   string
	Role        string
	Permissions []string
}

func WithContext(ctx context.Context, auth *AuthContext) context.Context {
	return context.WithValue(ctx, contextKey{}, auth)
}

func FromContext(ctx context.Context) (*AuthContext, bool) {
	auth, ok := ctx.Value(contextKey{}).(*AuthContext)
	return auth, ok && auth != nil
}

func MustFromContext(ctx context.Context) (*AuthContext, error) {
	auth, ok := FromContext(ctx)
	if !ok {
		return nil, ErrAccessDenied
	}
	return auth, nil
}

// PermissionsForRole returns the permission set granted to a role.
// Permissions are "<resource>:<action>" keys; the admin role gets the wildcard.
func PermissionsForRole(role string) []string {
	switch strings.ToLower(strings.TrimSpace(role)) {
	case RoleAdmin:
		return []string{PermissionAll}
	case RoleEditor:
		return []string{
			"content:read", "content:write",
			"blog:read", "blog:write",
			"media:read", "media:write",
			"reviews:read", "reviews:write",
			"leads:read",
			"dashboard:read",
		}
	default:
		return []string{}
	}
}

func HasPermission(auth *AuthContext, key string) bool {
	if auth == nil || key == "" {
		return false
	}
	for _, p := range auth.Permissions {
		if p == PermissionAll || p == key {
			return true
		}
	}
	return false
}

func AssertPermission(auth *AuthContext, key string) error {
	if !HasPermission(auth, key) {
		return ErrAccessDenied
	}
	return nil
}

func AssertAnyPermission(auth *AuthContext, keys ...string) error {
	for _, k := range keys {
		if HasPermission(auth, k) {
			return nil
		}
	}
	return ErrAccessDenied
}

func RequirePermission(ctx context.Context, key string) error {
	auth, err := MustFromContext(ctx)
	if err != nil {
		return err
	}
	return AssertPermission(auth, key)
}

func RequireAnyPermission(ctx context.Context, keys ...string) error {
	auth, err := MustFromContext(ctx)
	if err != nil {
		return err
	}
	return AssertAnyPermission(auth, keys...)
}
