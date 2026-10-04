package utils

import (
	"testing"
	"time"
)

func TestIssueAndValidateToken(t *testing.T) {
	t.Setenv("JWT_SECRET", "test-secret-for-unit-tests")
	jwtSecret = nil

	token, exp, err := IssueAccessToken("user-1", "session-1", "admin", []string{"*"}, 5*time.Minute)
	if err != nil {
		t.Fatalf("issue: %v", err)
	}
	if time.Until(exp) <= 0 {
		t.Fatalf("expiry should be in the future")
	}
	info, err := ValidateToken(token)
	if err != nil {
		t.Fatalf("validate: %v", err)
	}
	if info.UserID != "user-1" || info.SessionID != "session-1" || info.Role != "admin" {
		t.Fatalf("unexpected claims: %+v", info)
	}
	if _, err := ValidateToken(token + "x"); err == nil {
		t.Fatalf("tampered token should fail")
	}
}
