package files

import (
	"testing"
	"time"
)

func TestClassify(t *testing.T) {
	cases := map[string]string{
		"image/png":       CategoryImages,
		"image/gif":       CategoryGifs,
		"video/mp4":       CategoryVideos,
		"application/pdf": CategoryDocuments,
	}
	for ct, want := range cases {
		if got := Classify(ct); got != want {
			t.Errorf("Classify(%q) = %q, want %q", ct, got, want)
		}
	}
}

func TestObjectKeyRoundTrip(t *testing.T) {
	at := time.Date(2026, 3, 9, 12, 0, 0, 0, time.UTC)
	key := ObjectKey(CategoryImages, "01ABC", ".png", at)
	if key != "uploads/images/2026/03/09/01ABC.png" {
		t.Fatalf("unexpected key %q", key)
	}
	parsed, err := ParseObjectKey("images", "2026", "03", "09", "01ABC.png")
	if err != nil || parsed != key {
		t.Fatalf("parse mismatch: %q %v", parsed, err)
	}
	if _, err := ParseObjectKey("evil", "2026", "03", "09", "x"); err == nil {
		t.Fatalf("invalid category should fail")
	}
	if _, err := ParseObjectKey("images", "2026", "03", "09", "../x"); err == nil {
		t.Fatalf("path traversal should fail")
	}
}

func TestSanitize(t *testing.T) {
	if got := SanitizeFilename("../../etc/passwd"); got != "passwd" {
		t.Fatalf("unexpected %q", got)
	}
	if got := SanitizeFolder("Blog Images!"); got != "general" {
		t.Fatalf("unexpected %q", got)
	}
	if got := SanitizeFolder("blog"); got != "blog" {
		t.Fatalf("unexpected %q", got)
	}
	if !IsBlockedPublicType("image/svg+xml; charset=utf-8") {
		t.Fatalf("svg must be blocked for public uploads")
	}
}
