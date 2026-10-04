package themes

// Preset is a built-in theme. Built-ins cannot be edited; duplicate one to make a custom theme.
type Preset struct {
	Slug       string
	Definition Definition
}

// DefaultSlug is the theme used until another is chosen in the admin.
const DefaultSlug = "powder"

// Amber for the role line under the name: amber-600 nudged just dark enough to keep 3:1 on the
// light canvas, and amber-500 at night.
const (
	amberLight = "#c86a05"
	amberDark  = "#f59e0b"
)

// Presets lists the built-in themes in the order the admin shows them.
var Presets = []Preset{
	{"powder", Definition{
		Name: "Powder", Description: "Soft blue taken from the background of your photo", Surface: "slate",
		LogoFrom: "#4f97c7", LogoTo: "#23648e", Backdrop: "#c4e4f6",
		Light: ModeColors{Accent: "#23648e", ButtonFrom: "#23648e", ButtonTo: "#23648e", Highlight: amberLight},
		Dark:  ModeColors{Accent: "#bfe1f6", ButtonFrom: "#bfe1f6", ButtonTo: "#bfe1f6", Highlight: amberDark},
	}},
	{"soft-sky", Definition{
		Name: "Soft sky", Description: "A calmer, lighter sky blue", Surface: "slate",
		LogoFrom: "#2f86c2", LogoTo: "#167f93", Backdrop: "#bfe4f5",
		Light: ModeColors{Accent: "#1667a0", ButtonFrom: "#1667a0", ButtonTo: "#127483", Highlight: amberLight},
		Dark:  ModeColors{Accent: "#86ccf0", ButtonFrom: "#79c3ee", ButtonTo: "#7fd8e6", Highlight: amberDark},
	}},
	{"steel", Definition{
		Name: "Steel", Description: "Muted grey-blue, quiet and corporate", Surface: "slate",
		LogoFrom: "#5f86ad", LogoTo: "#34587d", Backdrop: "#cfdbe7",
		Light: ModeColors{Accent: "#34587d", ButtonFrom: "#34587d", ButtonTo: "#34587d", Highlight: amberLight},
		Dark:  ModeColors{Accent: "#a9c2dc", ButtonFrom: "#a9c2dc", ButtonTo: "#a9c2dc", Highlight: amberDark},
	}},
	{"teal", Definition{
		Name: "Teal", Description: "Fresh blue-green from the cyan end of the old gradient", Surface: "slate",
		LogoFrom: "#0d9488", LogoTo: "#0e7490", Backdrop: "#c3ebe5",
		Light: ModeColors{Accent: "#0f766e", ButtonFrom: "#0f766e", ButtonTo: "#0e7490", Highlight: amberLight},
		Dark:  ModeColors{Accent: "#6fdccf", ButtonFrom: "#5eead4", ButtonTo: "#67e8f9", Highlight: amberDark},
	}},
	{"lavender", Definition{
		Name: "Lavender", Description: "Soft indigo, a different direction", Surface: "slate",
		LogoFrom: "#6366f1", LogoTo: "#7c3aed", Backdrop: "#d8dafb",
		Light: ModeColors{Accent: "#4f46e5", ButtonFrom: "#4f46e5", ButtonTo: "#4f46e5", Highlight: amberLight},
		Dark:  ModeColors{Accent: "#b7bdfa", ButtonFrom: "#b7bdfa", ButtonTo: "#b7bdfa", Highlight: amberDark},
	}},
	{"original", Definition{
		Name: "Original", Description: "The old single-page site: sky name, cyan accents, blue-to-cyan buttons", Surface: "slate",
		LogoFrom: "#2563eb", LogoTo: "#0891b2", Backdrop: "#c4e4f6",
		Light: ModeColors{Accent: "#0369a1", ButtonFrom: "#2563eb", ButtonTo: "#0e7490", Highlight: amberLight},
		Dark:  ModeColors{Accent: "#22d3ee", ButtonFrom: "#2563eb", ButtonTo: "#0e7490", Highlight: amberDark},
	}},
	{"sky", Definition{
		Name: "Sky", Description: "Bright sky blue with blue-to-cyan buttons", Surface: "slate",
		LogoFrom: "#2563eb", LogoTo: "#0891b2", Backdrop: "#c4e4f6",
		Light: ModeColors{Accent: "#0369a1", ButtonFrom: "#2563eb", ButtonTo: "#0e7490", Highlight: amberLight},
		Dark:  ModeColors{Accent: "#38bdf8", ButtonFrom: "#2563eb", ButtonTo: "#0e7490", Highlight: amberDark},
	}},
	{"midnight", Definition{
		Name: "Midnight", Description: "Ice blue on a deep navy night", Surface: "navy",
		LogoFrom: "#3d7fb8", LogoTo: "#1e4f7a", Backdrop: "#c6dcef",
		Light: ModeColors{Accent: "#1e5b8a", ButtonFrom: "#1e5b8a", ButtonTo: "#1e5b8a", Highlight: amberLight},
		Dark:  ModeColors{Accent: "#9fd0f5", ButtonFrom: "#9fd0f5", ButtonTo: "#bfe3f9", Highlight: "#fbbf24"},
	}},
	{"forest", Definition{
		Name: "Forest", Description: "Deep green on warm paper", Surface: "warm",
		LogoFrom: "#15803d", LogoTo: "#14532d", Backdrop: "#cfe8d6",
		Light: ModeColors{Accent: "#166534", ButtonFrom: "#15803d", ButtonTo: "#166534", Highlight: "#b45309"},
		Dark:  ModeColors{Accent: "#86efac", ButtonFrom: "#86efac", ButtonTo: "#a7f3d0", Highlight: "#fbbf24"},
	}},
	{"rose", Definition{
		Name: "Rose", Description: "Bold berry red", Surface: "slate",
		LogoFrom: "#e11d48", LogoTo: "#9f1239", Backdrop: "#f6d3da",
		Light: ModeColors{Accent: "#be123c", ButtonFrom: "#be123c", ButtonTo: "#9f1239", Highlight: "#b45309"},
		Dark:  ModeColors{Accent: "#fda4af", ButtonFrom: "#fda4af", ButtonTo: "#fecdd3", Highlight: "#fbbf24"},
	}},
	{"sunset", Definition{
		Name: "Sunset", Description: "Warm orange with a teal role line", Surface: "graphite",
		LogoFrom: "#ea580c", LogoTo: "#9a3412", Backdrop: "#f9dcc8",
		Light: ModeColors{Accent: "#bc3f0c", ButtonFrom: "#c2410c", ButtonTo: "#9a3412", Highlight: "#0f766e"},
		Dark:  ModeColors{Accent: "#fb923c", ButtonFrom: "#f97316", ButtonTo: "#fb923c", Highlight: "#5eead4"},
	}},
	{"gold", Definition{
		Name: "Gold", Description: "Gold to match the vest, with ink-dark details", Surface: "warm",
		LogoFrom: "#c2700c", LogoTo: "#92400e", Backdrop: "#f3e1bf",
		Light: ModeColors{Accent: "#935906", ButtonFrom: "#b45309", ButtonTo: "#92400e", Highlight: "#44403c"},
		Dark:  ModeColors{Accent: "#fbbf24", ButtonFrom: "#fbbf24", ButtonTo: "#f59e0b", Highlight: "#e7e5e4"},
	}},
	{"mono", Definition{
		Name: "Mono", Description: "Black and white with an amber role line", Surface: "graphite",
		LogoFrom: "#3f3f46", LogoTo: "#09090b", Backdrop: "#e4e4e7",
		Light: ModeColors{Accent: "#18181b", ButtonFrom: "#18181b", ButtonTo: "#3f3f46", Highlight: amberLight},
		Dark:  ModeColors{Accent: "#fafafa", ButtonFrom: "#fafafa", ButtonTo: "#e4e4e7", Highlight: amberDark},
	}},
}

func presetBySlug(slug string) (Preset, bool) {
	for _, p := range Presets {
		if p.Slug == slug {
			return p, true
		}
	}
	return Preset{}, false
}

func defaultPreset() Preset {
	p, _ := presetBySlug(DefaultSlug)
	return p
}
