package resumes

import "portfolio-backend/internal/render"

type GenerateRequest struct {
	Template    string          `json:"template" binding:"required,oneof=modern classic compact"`
	Label       string          `json:"label" binding:"max=80"`
	AccentColor string          `json:"accentColor" binding:"omitempty,hexcolor"`
	Options     *render.Options `json:"options"`
	SetCurrent  *bool           `json:"setCurrent"`
}
