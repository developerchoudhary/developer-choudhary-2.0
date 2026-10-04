package shared

import (
	"fmt"
	"strings"
	"time"

	"portfolio-backend/pkg/dateparse"
)

// DateOnly marshals as YYYY-MM-DD and accepts the formats supported by dateparse.
type DateOnly time.Time

func (d *DateOnly) UnmarshalJSON(b []byte) error {
	s := strings.Trim(string(b), `"`)
	if s == "" || s == "null" {
		return fmt.Errorf("date is required")
	}

	t, err := dateparse.ParseDate(s)
	if err != nil {
		return err
	}

	*d = DateOnly(*t)
	return nil
}

func (d DateOnly) MarshalJSON() ([]byte, error) {
	t := time.Time(d)
	if t.IsZero() {
		return []byte("null"), nil
	}
	return []byte(`"` + t.Format("2006-01-02") + `"`), nil
}

func FormatDate(t *time.Time) *string {
	if t == nil || t.IsZero() {
		return nil
	}
	s := t.Format("2006-01-02")
	return &s
}

func FormatTime(t *time.Time) *string {
	if t == nil || t.IsZero() {
		return nil
	}
	s := t.UTC().Format(time.RFC3339)
	return &s
}

func NullableString(s string) *string {
	s = strings.TrimSpace(s)
	if s == "" {
		return nil
	}
	return &s
}

func StringOrEmpty(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
