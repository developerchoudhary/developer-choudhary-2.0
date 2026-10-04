package auth

import "portfolio-backend/internal/modules/users"

type TokenResponse struct {
	AccessToken  string             `json:"accessToken"`
	TokenType    string             `json:"tokenType"`
	ExpiresAt    string             `json:"expiresAt"`
	RefreshToken string             `json:"refreshToken,omitempty"`
	User         *users.ResponseDTO `json:"user"`
	Permissions  []string           `json:"permissions"`
}
