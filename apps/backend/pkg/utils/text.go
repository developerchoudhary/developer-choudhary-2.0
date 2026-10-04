package utils

import (
	"math"
	"regexp"
	"strings"
	"unicode/utf8"
)

var wordSplit = regexp.MustCompile(`\s+`)

// ReadingTimeMinutes estimates reading time at ~200 words per minute (minimum 1).
func ReadingTimeMinutes(text string) int {
	words := len(wordSplit.Split(strings.TrimSpace(text), -1))
	if strings.TrimSpace(text) == "" {
		words = 0
	}
	minutes := int(math.Ceil(float64(words) / 200.0))
	if minutes < 1 {
		minutes = 1
	}
	return minutes
}

// Truncate shortens s to max runes, appending an ellipsis when cut.
func Truncate(s string, max int) string {
	s = strings.TrimSpace(s)
	if utf8.RuneCountInString(s) <= max {
		return s
	}
	runes := []rune(s)
	cut := strings.TrimSpace(string(runes[:max]))
	if idx := strings.LastIndex(cut, " "); idx > max/2 {
		cut = cut[:idx]
	}
	return cut + "…"
}
