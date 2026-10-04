package themes

// SurfaceTokens are the neutral colours of one mode: page, cards, text and lines.
type SurfaceTokens struct {
	Bg         string
	BgElevated string
	BgMuted    string
	BgInset    string
	Fg         string
	FgMuted    string
	FgSubtle   string
	Line       string
	LineStrong string
	CanvasMid  string
	CanvasEnd  string
}

// Surface is a background style a theme sits on.
type Surface struct {
	Key         string
	Label       string
	Description string
	Light       SurfaceTokens
	Dark        SurfaceTokens
}

// Surfaces lists the background styles, in the order the admin shows them.
var Surfaces = []Surface{
	{
		Key: "slate", Label: "Slate", Description: "Cool grey-blue, like the original site",
		Light: SurfaceTokens{Bg: "#f8fafc", BgElevated: "#ffffff", BgMuted: "#f1f5f9", BgInset: "#e2e8f0",
			Fg: "#0f172a", FgMuted: "#475569", FgSubtle: "#5a6779",
			Line: "rgb(15 23 42 / 0.09)", LineStrong: "rgb(15 23 42 / 0.17)", CanvasMid: "#eff3f8", CanvasEnd: "#e6ecf4"},
		Dark: SurfaceTokens{Bg: "#17181c", BgElevated: "#1f2127", BgMuted: "#26292f", BgInset: "#111215",
			Fg: "#f1f5f9", FgMuted: "#a1a9b6", FgSubtle: "#8a93a3",
			Line: "rgb(255 255 255 / 0.08)", LineStrong: "rgb(255 255 255 / 0.15)", CanvasMid: "#1b1d22", CanvasEnd: "#21242b"},
	},
	{
		Key: "navy", Label: "Navy", Description: "Deep blue night, crisp white days",
		Light: SurfaceTokens{Bg: "#f5f8fc", BgElevated: "#ffffff", BgMuted: "#edf2f9", BgInset: "#dfe7f1",
			Fg: "#0b1a2e", FgMuted: "#3f5068", FgSubtle: "#53637b",
			Line: "rgb(11 26 46 / 0.09)", LineStrong: "rgb(11 26 46 / 0.17)", CanvasMid: "#ecf2f9", CanvasEnd: "#e1eaf4"},
		Dark: SurfaceTokens{Bg: "#0d1524", BgElevated: "#141e31", BgMuted: "#1b2740", BgInset: "#091020",
			Fg: "#eaf1fb", FgMuted: "#a3b2c9", FgSubtle: "#8494ad",
			Line: "rgb(255 255 255 / 0.08)", LineStrong: "rgb(255 255 255 / 0.15)", CanvasMid: "#111b2e", CanvasEnd: "#16223a"},
	},
	{
		Key: "warm", Label: "Warm", Description: "Soft paper and warm charcoal",
		Light: SurfaceTokens{Bg: "#faf8f5", BgElevated: "#ffffff", BgMuted: "#f4f0ea", BgInset: "#e8e1d7",
			Fg: "#1c1917", FgMuted: "#57534e", FgSubtle: "#6b625a",
			Line: "rgb(28 25 23 / 0.09)", LineStrong: "rgb(28 25 23 / 0.17)", CanvasMid: "#f5f1eb", CanvasEnd: "#ede6dc"},
		Dark: SurfaceTokens{Bg: "#1a1816", BgElevated: "#23201d", BgMuted: "#2b2724", BgInset: "#131110",
			Fg: "#f5f1ec", FgMuted: "#b0a79d", FgSubtle: "#958b80",
			Line: "rgb(255 255 255 / 0.08)", LineStrong: "rgb(255 255 255 / 0.15)", CanvasMid: "#1e1b18", CanvasEnd: "#24201c"},
	},
	{
		Key: "graphite", Label: "Graphite", Description: "Pure neutral greys, near black at night",
		Light: SurfaceTokens{Bg: "#fafafa", BgElevated: "#ffffff", BgMuted: "#f4f4f5", BgInset: "#e4e4e7",
			Fg: "#09090b", FgMuted: "#52525b", FgSubtle: "#63636c",
			Line: "rgb(9 9 11 / 0.09)", LineStrong: "rgb(9 9 11 / 0.17)", CanvasMid: "#f4f4f5", CanvasEnd: "#ececee"},
		Dark: SurfaceTokens{Bg: "#0f0f11", BgElevated: "#18181b", BgMuted: "#202024", BgInset: "#09090b",
			Fg: "#fafafa", FgMuted: "#a1a1aa", FgSubtle: "#8b8b94",
			Line: "rgb(255 255 255 / 0.08)", LineStrong: "rgb(255 255 255 / 0.15)", CanvasMid: "#131316", CanvasEnd: "#18181c"},
	},
}

func surfaceByKey(key string) (Surface, bool) {
	for _, s := range Surfaces {
		if s.Key == key {
			return s, true
		}
	}
	return Surface{}, false
}
