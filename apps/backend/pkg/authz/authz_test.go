package authz

import (
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

func TestAssertPermission(t *testing.T) {
	auth := &AuthContext{Permissions: []string{"leads:read"}}
	if err := AssertPermission(auth, "leads:read"); err != nil {
		t.Fatalf("expected access, got %v", err)
	}
	if err := AssertPermission(auth, "leads:write"); err == nil {
		t.Fatalf("expected access denied")
	}
	if err := AssertPermission(nil, "leads:read"); err == nil {
		t.Fatalf("expected access denied without an auth context")
	}
}
