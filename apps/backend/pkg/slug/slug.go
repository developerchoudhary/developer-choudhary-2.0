package slug

import (
	"regexp"
	"strings"
	"unicode"

	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

var (
	nonAlnum   = regexp.MustCompile(`[^a-z0-9]+`)
	multiDash  = regexp.MustCompile(`-{2,}`)
	maxSlugLen = 96
)

// Make converts free text into a URL-safe slug ("Hello, World!" -> "hello-world").
func Make(input string) string {
	t := transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
	ascii, _, err := transform.String(t, input)
	if err != nil {
		ascii = input
	}
	s := strings.ToLower(strings.TrimSpace(ascii))
	s = nonAlnum.ReplaceAllString(s, "-")
	s = multiDash.ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")
	if len(s) > maxSlugLen {
		s = strings.Trim(s[:maxSlugLen], "-")
	}
	return s
}

// Coalesce returns the explicit slug when valid, otherwise derives one from fallback text.
func Coalesce(explicit, fallback string) string {
	explicit = strings.TrimSpace(explicit)
	if explicit != "" {
		return Make(explicit)
	}
	return Make(fallback)
}
