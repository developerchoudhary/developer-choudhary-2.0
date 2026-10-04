package themes

// ThemeDTO is a built-in or custom theme with everything the admin needs to show and preview it.
type ThemeDTO struct {
	ID      *string `json:"id"`
	Slug    string  `json:"slug"`
	Builtin bool    `json:"builtin"`
	Active  bool    `json:"active"`
	Definition
	Tokens  ModeTokens `json:"tokens"`
	CSS     string     `json:"css"`
	Version string     `json:"version"`
	Issues  []Issue    `json:"issues"`
}

type SurfaceDTO struct {
	Key         string `json:"key"`
	Label       string `json:"label"`
	Description string `json:"description"`
	LightBg     string `json:"lightBg"`
	DarkBg      string `json:"darkBg"`
}

type ListDTO struct {
	Active   string       `json:"active"`
	Surfaces []SurfaceDTO `json:"surfaces"`
	Themes   []ThemeDTO   `json:"themes"`
}

// PreviewDTO is an unsaved definition resolved for the live preview in the admin.
type PreviewDTO struct {
	Tokens ModeTokens `json:"tokens"`
	CSS    string     `json:"css"`
	Issues []Issue    `json:"issues"`
}

// ActiveDTO is what the public site needs: the CSS to inject and the tokens for icons and share images.
type ActiveDTO struct {
	Slug    string     `json:"slug"`
	Name    string     `json:"name"`
	Version string     `json:"version"`
	CSS     string     `json:"css"`
	Tokens  ModeTokens `json:"tokens"`
}

func surfaceList() []SurfaceDTO {
	out := make([]SurfaceDTO, 0, len(Surfaces))
	for _, s := range Surfaces {
		out = append(out, SurfaceDTO{Key: s.Key, Label: s.Label, Description: s.Description, LightBg: s.Light.Bg, DarkBg: s.Dark.Bg})
	}
	return out
}

func issuesOrEmpty(in []Issue) []Issue {
	if in == nil {
		return []Issue{}
	}
	return in
}
