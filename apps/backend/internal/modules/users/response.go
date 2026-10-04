package users

import (
	"time"

	"portfolio-backend/internal/shared"
)

type ResponseDTO struct {
	ID          string  `json:"id"`
	Email       string  `json:"email"`
	Name        string  `json:"name"`
	Role        string  `json:"role"`
	IsActive    bool    `json:"isActive"`
	LastLoginAt *string `json:"lastLoginAt"`
	CreatedAt   string  `json:"createdAt"`
	UpdatedAt   string  `json:"updatedAt"`
}

func ToResponse(u *User) *ResponseDTO {
	if u == nil {
		return nil
	}
	return &ResponseDTO{
		ID:          u.ID.String(),
		Email:       u.Email,
		Name:        u.Name,
		Role:        u.Role,
		IsActive:    u.IsActive,
		LastLoginAt: shared.FormatTime(u.LastLoginAt),
		CreatedAt:   u.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt:   u.UpdatedAt.UTC().Format(time.RFC3339),
	}
}

func ToListResponse(items []*User) []*ResponseDTO {
	out := make([]*ResponseDTO, 0, len(items))
	for _, it := range items {
		out = append(out, ToResponse(it))
	}
	return out
}
