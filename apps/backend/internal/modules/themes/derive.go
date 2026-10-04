package themes

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
)

// Minimum WCAG contrast ratios the derived theme must meet.
const (
	minText    = 4.5 // body text, links and button labels
	minGraphic = 3.0 // the large role line under the name, and the white letter of the logo
)

// ModeColors are the colours chosen for one mode; everything else is derived from them.
type ModeColors struct {
	Accent     string `json:"accent"`     // your name, links, icons
	ButtonFrom string `json:"buttonFrom"` // main button gradient start
	ButtonTo   string `json:"buttonTo"`   // main button gradient end; same as the start for a solid button
	Highlight  string `json:"highlight"`  // the role line under your name, stars
}

// Definition is everything that makes a theme.
type Definition struct {
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Surface     string     `json:"surface"`
	LogoFrom    string     `json:"logoFrom"`
	LogoTo      string     `json:"logoTo"`
	Backdrop    string     `json:"backdrop"` // the background behind your photo (same in both modes)
	Light       ModeColors `json:"light"`
	Dark        ModeColors `json:"dark"`
}

// Tokens are the CSS custom properties of one mode (see apps/frontend/src/styles/globals.css).
type Tokens struct {
	Bg           string `json:"bg"`
	BgElevated   string `json:"bgElevated"`
	BgMuted      string `json:"bgMuted"`
	BgInset      string `json:"bgInset"`
	Fg           string `json:"fg"`
	FgMuted      string `json:"fgMuted"`
	FgSubtle     string `json:"fgSubtle"`
	Line         string `json:"line"`
	LineStrong   string `json:"lineStrong"`
	Canvas       string `json:"canvas"`
	Accent       string `json:"accent"`
	AccentStrong string `json:"accentStrong"`
	AccentFg     string `json:"accentFg"`
	AccentSoft   string `json:"accentSoft"`
	Highlight    string `json:"highlight"`
	BtnFrom      string `json:"btnFrom"`
	BtnTo        string `json:"btnTo"`
	BtnHoverFrom string `json:"btnHoverFrom"`
	BtnHoverTo   string `json:"btnHoverTo"`
	BtnFg        string `json:"btnFg"`
	BtnGlow      string `json:"btnGlow"`
	BrandFrom    string `json:"brandFrom"`
	BrandTo      string `json:"brandTo"`
	Frame        string `json:"frame"`
	PhotoFrom    string `json:"photoFrom"`
	PhotoTo      string `json:"photoTo"`
	PhotoGlow    string `json:"photoGlow"`
}

type ModeTokens struct {
	Light Tokens `json:"light"`
	Dark  Tokens `json:"dark"`
}

// Issue explains why a theme cannot be saved, in words an editor can act on.
type Issue struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// Resolved is a definition turned into tokens, the CSS the site injects and any problems.
type Resolved struct {
	Tokens  ModeTokens
	CSS     string
	Version string
	Issues  []Issue
}

// Resolve derives both modes from a definition. Unparseable colours are reported and replaced
// with the default theme's colours, so a half-finished theme can still be previewed.
func Resolve(def Definition) Resolved {
	r := &resolver{}
	fallback := defaultPreset().Definition
	surface, ok := surfaceByKey(def.Surface)
	if !ok {
		r.add("surface", "Choose a background style.")
		surface, _ = surfaceByKey(fallback.Surface)
	}
	logoFrom := r.color("logo", "Logo start", def.LogoFrom, fallback.LogoFrom)
	logoTo := r.color("logo", "Logo end", def.LogoTo, fallback.LogoTo)
	if c := minContrast(white, logoFrom, logoTo); c < minGraphic {
		r.add("logo", fmt.Sprintf("Logo: the white letter is hard to see on these colours (%.1f:1, needs 3:1). Choose darker logo colours.", c))
	}
	backdrop := r.color("backdrop", "Photo background", def.Backdrop, fallback.Backdrop)
	light := r.mode("light", surface.Light, def.Light, fallback.Light, logoFrom, logoTo, backdrop)
	dark := r.mode("dark", surface.Dark, def.Dark, fallback.Dark, logoFrom, logoTo, backdrop)
	css := "html:root{" + light.vars() + "}html.dark{" + dark.vars() + "}"
	sum := sha256.Sum256([]byte(css))
	return Resolved{
		Tokens:  ModeTokens{Light: light, Dark: dark},
		CSS:     css,
		Version: hex.EncodeToString(sum[:4]),
		Issues:  r.issues,
	}
}

type resolver struct{ issues []Issue }

func (r *resolver) add(field, message string) {
	r.issues = append(r.issues, Issue{Field: field, Message: message})
}

func (r *resolver) color(field, label, value, fallback string) color {
	c, err := parseHex(value)
	if err != nil {
		r.add(field, fmt.Sprintf("%s: %v.", label, err))
		return mustHex(fallback)
	}
	return c
}

func (r *resolver) mode(mode string, s SurfaceTokens, m, fallback ModeColors, logoFrom, logoTo, backdrop color) Tokens {
	title := strings.ToUpper(mode[:1]) + mode[1:] + " mode"
	accent := r.color(mode+".accent", title+" accent", m.Accent, fallback.Accent)
	btnFrom := r.color(mode+".button", title+" button start", m.ButtonFrom, fallback.ButtonFrom)
	btnTo := r.color(mode+".button", title+" button end", m.ButtonTo, fallback.ButtonTo)
	highlight := r.color(mode+".highlight", title+" highlight", m.Highlight, fallback.Highlight)
	backgrounds := []color{mustHex(s.Bg), mustHex(s.BgElevated), mustHex(s.CanvasEnd)}

	if c := minContrast(accent, backgrounds...); c < minText {
		hint := "a darker"
		if mode == "dark" {
			hint = "a lighter"
		}
		r.add(mode+".accent", fmt.Sprintf("%s: the accent colour is hard to read on the background (%.1f:1, needs 4.5:1). Choose %s colour.", title, c, hint))
	}
	accentFg, accentFgContrast := readableOn(accent)
	if accentFgContrast < minText {
		r.add(mode+".accent", fmt.Sprintf("%s: the accent is a mid tone, so neither white nor dark text reads well on it (%.1f:1). Choose a lighter or darker accent.", title, accentFgContrast))
	}

	samples := gradientSamples(btnFrom, btnTo)
	btnFg, btnContrast := readableOnAll(samples)
	if btnContrast < minText {
		r.add(mode+".button", fmt.Sprintf("%s: button text would be hard to read on these colours (%.1f:1, needs 4.5:1). Make the button colours darker or lighter.", title, btnContrast))
	}
	hoverFrom, hoverTo := mix(btnFrom, black, 0.15), mix(btnTo, black, 0.15)
	if btnFg != white {
		hoverFrom, hoverTo = mix(btnFrom, white, 0.25), mix(btnTo, white, 0.25)
	}
	// The role line sits in the upper part of the page canvas and on cards, not in the far corner.
	if c := minContrast(highlight, mustHex(s.Bg), mustHex(s.BgElevated), mustHex(s.CanvasMid)); c < minGraphic {
		r.add(mode+".highlight", fmt.Sprintf("%s: the highlight colour is too faint on the background (%.1f:1, needs 3:1).", title, c))
	}

	// The frame is the shape offset behind the photo: a lighter tint of the photo background by
	// day, a faint wash of the accent at night.
	strong, soft, glow, frame := mix(accent, black, 0.2), accent.alpha(0.09), btnTo.alpha(0.45), mix(backdrop, white, 0.35).hex()
	if mode == "dark" {
		strong, soft, glow, frame = mix(accent, white, 0.35), accent.alpha(0.12), btnTo.alpha(0.3), accent.alpha(0.15)
	}
	return Tokens{
		Bg: s.Bg, BgElevated: s.BgElevated, BgMuted: s.BgMuted, BgInset: s.BgInset,
		Fg: s.Fg, FgMuted: s.FgMuted, FgSubtle: s.FgSubtle, Line: s.Line, LineStrong: s.LineStrong,
		Canvas:       fmt.Sprintf("linear-gradient(135deg, %s 0%%, %s 55%%, %s 100%%)", s.Bg, s.CanvasMid, s.CanvasEnd),
		Accent:       accent.hex(),
		AccentStrong: strong.hex(),
		AccentFg:     accentFg.hex(),
		AccentSoft:   soft,
		Highlight:    highlight.hex(),
		BtnFrom:      btnFrom.hex(),
		BtnTo:        btnTo.hex(),
		BtnHoverFrom: hoverFrom.hex(),
		BtnHoverTo:   hoverTo.hex(),
		BtnFg:        btnFg.hex(),
		BtnGlow:      glow,
		BrandFrom:    logoFrom.hex(),
		BrandTo:      logoTo.hex(),
		Frame:        frame,
		// The photo is a transparent cut-out; the site paints this studio backdrop behind it, the
		// same in both modes: a pale tint top right, the chosen colour bottom left, a deeper bounce light.
		PhotoFrom: mix(backdrop, white, 0.72).hex(),
		PhotoTo:   backdrop.hex(),
		PhotoGlow: mix(white, backdrop, 2).alpha(0.3),
	}
}

// readableOn picks white or a deep shade of the colour itself, whichever reads better on it.
func readableOn(bg color) (color, float64) {
	return readableOnAll([]color{bg})
}

func readableOnAll(bgs []color) (color, float64) {
	mid := bgs[len(bgs)/2]
	ink := mix(mid, black, 0.84)
	w, k := minContrast(white, bgs...), minContrast(ink, bgs...)
	if w >= k {
		return white, w
	}
	return ink, k
}

func (t Tokens) vars() string {
	pairs := [][2]string{
		{"--bg", t.Bg}, {"--bg-elevated", t.BgElevated}, {"--bg-muted", t.BgMuted}, {"--bg-inset", t.BgInset},
		{"--fg", t.Fg}, {"--fg-muted", t.FgMuted}, {"--fg-subtle", t.FgSubtle},
		{"--line", t.Line}, {"--line-strong", t.LineStrong}, {"--canvas", t.Canvas},
		{"--accent", t.Accent}, {"--accent-strong", t.AccentStrong}, {"--accent-fg", t.AccentFg},
		{"--accent-soft", t.AccentSoft}, {"--info", t.Accent}, {"--highlight", t.Highlight},
		{"--btn-from", t.BtnFrom}, {"--btn-to", t.BtnTo}, {"--btn-hover-from", t.BtnHoverFrom},
		{"--btn-hover-to", t.BtnHoverTo}, {"--btn-fg", t.BtnFg}, {"--btn-glow", t.BtnGlow},
		{"--brand-from", t.BrandFrom}, {"--brand-to", t.BrandTo}, {"--frame", t.Frame},
		{"--photo-from", t.PhotoFrom}, {"--photo-to", t.PhotoTo}, {"--photo-glow", t.PhotoGlow},
	}
	var b strings.Builder
	for _, p := range pairs {
		b.WriteString(p[0])
		b.WriteByte(':')
		b.WriteString(p[1])
		b.WriteByte(';')
	}
	return b.String()
}
