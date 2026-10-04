package dateparse

import (
	"fmt"
	"strings"
	"time"
)

const DateLayout = "2006-01-02"

var dateLayouts = []string{
	"2006-01-02",
	"02-01-2006",
	"02/01/2006",
	"2006-01",
}

func ParseDate(value string) (*time.Time, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil, fmt.Errorf("invalid date format, expected YYYY-MM-DD")
	}

	for _, layout := range dateLayouts {
		parsed, err := time.Parse(layout, trimmed)
		if err == nil {
			return &parsed, nil
		}
	}

	return nil, fmt.Errorf("invalid date format, expected YYYY-MM-DD")
}

// ParseOptional returns nil for empty input and an error for malformed input.
func ParseOptional(value *string) (*time.Time, error) {
	if value == nil || strings.TrimSpace(*value) == "" {
		return nil, nil
	}
	return ParseDate(*value)
}
