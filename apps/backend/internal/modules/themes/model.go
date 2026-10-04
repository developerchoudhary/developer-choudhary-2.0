package themes

import (
	"portfolio-backend/internal/shared"

	"github.com/uptrace/bun"
)

// Theme is a custom theme created in the admin. Built-in themes live in presets.go.
type Theme struct {
	bun.BaseModel `bun:"table:themes,alias:themes"`

	shared.SoftDeleteModel `bun:",embed"`

	Slug        string     `bun:"slug,notnull"`
	Name        string     `bun:"name,notnull"`
	Description string     `bun:"description"`
	Surface     string     `bun:"surface,notnull"`
	LogoFrom    string     `bun:"logo_from,notnull"`
	LogoTo      string     `bun:"logo_to,notnull"`
	Backdrop    string     `bun:"backdrop,notnull"`
	Light       ModeColors `bun:"light,type:jsonb,notnull"`
	Dark        ModeColors `bun:"dark,type:jsonb,notnull"`
}

func (t *Theme) definition() Definition {
	return Definition{
		Name: t.Name, Description: t.Description, Surface: t.Surface,
		LogoFrom: t.LogoFrom, LogoTo: t.LogoTo, Backdrop: t.Backdrop, Light: t.Light, Dark: t.Dark,
	}
}
