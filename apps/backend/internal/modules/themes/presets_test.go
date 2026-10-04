package themes

import (
	"strings"
	"testing"

	"portfolio-backend/internal/modules/settings"
)

func TestPresetsAreReadable(t *testing.T) {
	seen := map[string]bool{}
	for _, p := range Presets {
		if seen[p.Slug] {
			t.Fatalf("duplicate preset slug %s", p.Slug)
		}
		seen[p.Slug] = true
		r := Resolve(p.Definition)
		for _, issue := range r.Issues {
			t.Errorf("%s: %s", p.Slug, issue.Message)
		}
	}
	if _, ok := presetBySlug(DefaultSlug); !ok {
		t.Fatalf("default preset %s missing", DefaultSlug)
	}
}

func TestSurfacesAreReadable(t *testing.T) {
	for _, s := range Surfaces {
		for mode, st := range map[string]SurfaceTokens{"light": s.Light, "dark": s.Dark} {
			for _, bg := range []string{st.Bg, st.BgElevated, st.CanvasEnd} {
				for name, fg := range map[string]string{"fg": st.Fg, "fgMuted": st.FgMuted, "fgSubtle": st.FgSubtle} {
					if c := contrast(mustHex(fg), mustHex(bg)); c < minText {
						t.Errorf("%s %s: %s %s on %s is %.2f:1", s.Key, mode, name, fg, bg, c)
					}
				}
			}
		}
	}
}

func TestResolveProducesCompleteCSS(t *testing.T) {
	r := Resolve(defaultPreset().Definition)
	for _, v := range []string{"--bg:", "--accent:", "--accent-fg:", "--btn-from:", "--btn-fg:", "--brand-from:", "--frame:", "--canvas:", "--highlight:", "--photo-from:", "--photo-to:", "--photo-glow:"} {
		if strings.Count(r.CSS, v) != 2 {
			t.Errorf("css should set %s once per mode: %s", v, r.CSS)
		}
	}
	if !strings.HasPrefix(r.CSS, "html:root{") || !strings.Contains(r.CSS, "}html.dark{") {
		t.Errorf("unexpected selectors: %s", r.CSS)
	}
	if len(r.Version) != 8 {
		t.Errorf("version should be 8 hex chars, got %q", r.Version)
	}
	if strings.ContainsAny(r.CSS, "<>\"'") {
		t.Errorf("css must not contain markup characters")
	}
}

func TestResolveReportsProblems(t *testing.T) {
	def := defaultPreset().Definition
	def.Light.Accent = "#a5d4f3" // far too pale for text on a light page
	def.Dark.ButtonFrom = "nope"
	def.LogoFrom = "#fef3c7" // white letter invisible
	def.Surface = "neon"
	def.Backdrop = "blue"
	fields := map[string]bool{}
	for _, i := range Resolve(def).Issues {
		fields[i.Field] = true
	}
	for _, f := range []string{"light.accent", "dark.button", "logo", "surface", "backdrop"} {
		if !fields[f] {
			t.Errorf("expected an issue for %s, got %v", f, fields)
		}
	}
}

func TestDefaultMatchesSettingsRegistry(t *testing.T) {
	d, ok := settings.Lookup(settings.KeyThemeActive)
	if !ok || d.Default != DefaultSlug {
		t.Fatalf("settings default for %s should be %q, got %v", settings.KeyThemeActive, DefaultSlug, d.Default)
	}
}

func TestPowderPhotoBackdropMatchesThePortrait(t *testing.T) {
	// The original portrait was composed on #eef7fd -> #c4e4f6 with a sky-300 bounce light.
	l := Resolve(defaultPreset().Definition).Tokens.Light
	if l.PhotoFrom != "#eef7fc" || l.PhotoTo != "#c4e4f6" {
		t.Errorf("powder photo backdrop drifted: %s -> %s", l.PhotoFrom, l.PhotoTo)
	}
}
