package settings

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestDefaultsAreValid(t *testing.T) {
	seen := map[string]bool{}
	for _, g := range Registry {
		for _, d := range g.Items {
			if seen[d.Key] {
				t.Fatalf("duplicate key %s", d.Key)
			}
			seen[d.Key] = true
			if !keyRe(d.Key) {
				t.Fatalf("key %q is not dotted camelCase", d.Key)
			}
			got, err := d.Normalize(d.DefaultJSON())
			if err != nil {
				t.Fatalf("%s: default rejected: %v", d.Key, err)
			}
			if string(got) != string(d.DefaultJSON()) {
				t.Fatalf("%s: default is not normalized: %s", d.Key, got)
			}
		}
	}
	for _, key := range []string{KeySiteName, KeyResponseTime, KeyFeatureReviews} {
		if _, ok := Lookup(key); !ok {
			t.Fatalf("backend key %s missing from the registry", key)
		}
	}
}

func keyRe(k string) bool {
	for _, part := range strings.Split(k, ".") {
		if part == "" || strings.ContainsAny(part, " -_") {
			return false
		}
	}
	return true
}

func normalize(t *testing.T, key string, value any) (string, error) {
	t.Helper()
	d, ok := Lookup(key)
	if !ok {
		t.Fatalf("unknown key %s", key)
	}
	raw, _ := json.Marshal(value)
	out, err := d.Normalize(raw)
	return string(out), err
}

func TestNormalize(t *testing.T) {
	cases := []struct {
		key     string
		value   any
		want    string
		wantErr bool
	}{
		{key: "site.name", value: "  Developer   Choudhary ", want: `"Developer Choudhary"`},
		{key: "site.name", value: strings.Repeat("x", 61), wantErr: true},
		{key: "site.name", value: 42, wantErr: true},
		{key: "cta.text", value: "Line one.\nLine two.", want: `"Line one.\nLine two."`},
		{key: "contact.calendarUrl", value: "", want: `""`},
		{key: "contact.calendarUrl", value: "https://cal.com/aman", want: `"https://cal.com/aman"`},
		{key: "contact.calendarUrl", value: "cal.com/aman", wantErr: true},
		{key: "features.blog", value: false, want: `false`},
		{key: "features.blog", value: "no", wantErr: true},
		{key: "hero.ctaPrimary", value: Link{Label: " Hire me ", Href: "/contact"}, want: `{"label":"Hire me","href":"/contact"}`},
		{key: "hero.ctaPrimary", value: Link{Label: "Mail", Href: "mailto:hi@example.com"}, want: `{"label":"Mail","href":"mailto:hi@example.com"}`},
		{key: "hero.ctaPrimary", value: Link{Label: "", Href: "/contact"}, wantErr: true},
		{key: "hero.ctaPrimary", value: Link{Label: "Go", Href: "contact"}, wantErr: true},
		{key: "seo.keywords", value: []string{" Next.js ", "", "Go"}, want: `["Next.js","Go"]`},
		{key: "seo.keywords", value: []string{strings.Repeat("k", 61)}, wantErr: true},
	}
	for _, c := range cases {
		got, err := normalize(t, c.key, c.value)
		if c.wantErr {
			if err == nil {
				t.Errorf("%s=%v: expected an error, got %s", c.key, c.value, got)
			}
			continue
		}
		if err != nil || got != c.want {
			t.Errorf("%s=%v: got %s (%v), want %s", c.key, c.value, got, err, c.want)
		}
	}
}
