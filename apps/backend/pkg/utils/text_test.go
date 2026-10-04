package utils

import (
	"strings"
	"testing"
)

func TestReadingTimeMinutes(t *testing.T) {
	if got := ReadingTimeMinutes(""); got != 1 {
		t.Fatalf("empty text should be 1 minute, got %d", got)
	}
	long := strings.Repeat("word ", 1000)
	if got := ReadingTimeMinutes(long); got != 5 {
		t.Fatalf("1000 words should be 5 minutes, got %d", got)
	}
}

func TestTruncate(t *testing.T) {
	if got := Truncate("short", 10); got != "short" {
		t.Fatalf("unexpected %q", got)
	}
	got := Truncate("the quick brown fox jumps over the lazy dog", 20)
	if !strings.HasSuffix(got, "…") || len(got) > 24 {
		t.Fatalf("unexpected %q", got)
	}
}
