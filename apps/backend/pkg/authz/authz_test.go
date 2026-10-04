package authz

import (
	"context"
	"testing"
)

func TestHasPermissionWildcard(t *testing.T) {
	auth := &AuthContext{Permissions: PermissionsForRole(RoleAdmin)}
	if !HasPermission(auth, "anything:write") {
		t.Fatalf("admin wildcard should grant every permission")
	}
}

func TestHasPermissionEditor(t *testing.T) {
	auth := &AuthContext{Permissions: PermissionsForRole(RoleEditor)}
	if !HasPermission(auth, "blog:write") {
		t.Fatalf("editor should have blog:write")
	}
	if HasPermission(auth, "users:write") {
		t.Fatalf("editor must not have users:write")
	}
}

func TestRequirePermissionFromContext(t *testing.T) {
	ctx := WithContext(context.Background(), &AuthContext{Permissions: []string{"leads:read"}})
	if err := RequirePermission(ctx, "leads:read"); err != nil {
		t.Fatalf("expected access, got %v", err)
	}
	if err := RequirePermission(ctx, "leads:write"); err == nil {
		t.Fatalf("expected access denied")
	}
	if err := RequirePermission(context.Background(), "leads:read"); err == nil {
		t.Fatalf("expected access denied without auth context")
	}
}
