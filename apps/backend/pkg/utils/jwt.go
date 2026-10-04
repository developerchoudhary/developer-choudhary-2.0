package utils

import (
	"errors"
	"fmt"
	"time"

	"portfolio-backend/internal/config"
	"portfolio-backend/pkg/authz"

	"github.com/golang-jwt/jwt/v5"
)

// UserClaims mirrors the token shape used across the CRM services:
// sub = user id, aud[0] = session id, plus role and permissions.
type UserClaims struct {
	Role        string   `json:"role"`
	Permissions []string `json:"permissions"`
	jwt.RegisteredClaims
}

type TokenInfo struct {
	UserID      string
	SessionID   string
	Role        string
	Permissions []string
	IssuedAt    time.Time
	ExpiresAt   time.Time
}

var jwtSecret []byte

func getJWTSecret() []byte {
	if jwtSecret == nil {
		jwtSecret = []byte(config.GetEnv("JWT_SECRET"))
	}
	return jwtSecret
}

// IssueAccessToken signs a short-lived HS256 access token.
func IssueAccessToken(userID, sessionID, role string, permissions []string, ttl time.Duration) (string, time.Time, error) {
	now := time.Now().UTC()
	expiresAt := now.Add(ttl)
	claims := &UserClaims{
		Role:        role,
		Permissions: permissions,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			Audience:  jwt.ClaimStrings{sessionID},
			Issuer:    "portfolio-backend",
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now.Add(-30 * time.Second)),
			ExpiresAt: jwt.NewNumericDate(expiresAt),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(getJWTSecret())
	if err != nil {
		return "", time.Time{}, fmt.Errorf("sign token: %w", err)
	}
	return signed, expiresAt, nil
}

func ValidateToken(tokenString string) (*TokenInfo, error) {
	token, err := jwt.ParseWithClaims(tokenString, &UserClaims{}, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return getJWTSecret(), nil
	}, jwt.WithLeeway(30*time.Second))

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	claims, ok := token.Claims.(*UserClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}

	userID := claims.Subject
	if userID == "" {
		return nil, errors.New("missing user ID in token")
	}

	if len(claims.Audience) == 0 || claims.Audience[0] == "" {
		return nil, errors.New("missing session ID in token")
	}

	permissions := claims.Permissions
	if permissions == nil {
		permissions = authz.PermissionsForRole(claims.Role)
	}

	info := &TokenInfo{
		UserID:      userID,
		SessionID:   claims.Audience[0],
		Role:        claims.Role,
		Permissions: permissions,
	}
	if claims.IssuedAt != nil {
		info.IssuedAt = claims.IssuedAt.Time
	}
	if claims.ExpiresAt != nil {
		info.ExpiresAt = claims.ExpiresAt.Time
	}
	return info, nil
}
