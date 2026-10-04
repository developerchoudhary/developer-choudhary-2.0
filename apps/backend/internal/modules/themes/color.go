package themes

import (
	"fmt"
	"math"
	"strconv"
	"strings"
)

// color is an sRGB colour with channels in 0..255.
type color struct{ r, g, b float64 }

var (
	white = color{255, 255, 255}
	black = color{0, 0, 0}
)

func parseHex(s string) (color, error) {
	s = strings.TrimSpace(s)
	if len(s) != 7 || s[0] != '#' {
		return color{}, fmt.Errorf("%q is not a colour like #1a2b3c", s)
	}
	v, err := strconv.ParseUint(s[1:], 16, 32)
	if err != nil {
		return color{}, fmt.Errorf("%q is not a colour like #1a2b3c", s)
	}
	return color{float64(v >> 16 & 0xff), float64(v >> 8 & 0xff), float64(v & 0xff)}, nil
}

func mustHex(s string) color {
	c, err := parseHex(s)
	if err != nil {
		panic(err)
	}
	return c
}

func clamp(v float64) int { return int(math.Round(math.Max(0, math.Min(255, v)))) }

func (c color) hex() string { return fmt.Sprintf("#%02x%02x%02x", clamp(c.r), clamp(c.g), clamp(c.b)) }

func (c color) alpha(a float64) string {
	return fmt.Sprintf("rgb(%d %d %d / %s)", clamp(c.r), clamp(c.g), clamp(c.b), strconv.FormatFloat(a, 'f', -1, 64))
}

// mix moves from a towards b by t (0..1).
func mix(a, b color, t float64) color {
	return color{a.r + (b.r-a.r)*t, a.g + (b.g-a.g)*t, a.b + (b.b-a.b)*t}
}

func channel(v float64) float64 {
	v /= 255
	if v <= 0.03928 {
		return v / 12.92
	}
	return math.Pow((v+0.055)/1.055, 2.4)
}

func luminance(c color) float64 {
	return 0.2126*channel(c.r) + 0.7152*channel(c.g) + 0.0722*channel(c.b)
}

// contrast is the WCAG contrast ratio between two colours (1..21).
func contrast(a, b color) float64 {
	la, lb := luminance(a), luminance(b)
	if la < lb {
		la, lb = lb, la
	}
	return (la + 0.05) / (lb + 0.05)
}

// minContrast is the lowest contrast of fg against any of the backgrounds.
func minContrast(fg color, bgs ...color) float64 {
	out := math.MaxFloat64
	for _, bg := range bgs {
		out = math.Min(out, contrast(fg, bg))
	}
	return out
}

// gradientSamples returns five evenly spaced colours along a two-stop gradient.
func gradientSamples(from, to color) []color {
	out := make([]color, 0, 5)
	for i := 0; i <= 4; i++ {
		out = append(out, mix(from, to, float64(i)/4))
	}
	return out
}
