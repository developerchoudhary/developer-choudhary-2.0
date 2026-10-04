package themes

// RequestDTO creates or updates a custom theme. Colours are #RRGGBB; readability is checked in the service.
type RequestDTO struct {
	Name        string     `json:"name" binding:"required,min=2,max=40"`
	Description string     `json:"description" binding:"max=120"`
	Surface     string     `json:"surface" binding:"required,oneof=slate navy warm graphite"`
	LogoFrom    string     `json:"logoFrom" binding:"required"`
	LogoTo      string     `json:"logoTo" binding:"required"`
	Backdrop    string     `json:"backdrop" binding:"required"`
	Light       ModeColors `json:"light" binding:"required"`
	Dark        ModeColors `json:"dark" binding:"required"`
}

func (r *RequestDTO) definition() Definition {
	return Definition{
		Name: r.Name, Description: r.Description, Surface: r.Surface,
		LogoFrom: r.LogoFrom, LogoTo: r.LogoTo, Backdrop: r.Backdrop, Light: r.Light, Dark: r.Dark,
	}
}

type ActivateRequest struct {
	Slug string `json:"slug" binding:"required,max=80"`
}
