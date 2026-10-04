package render

import (
	"strings"
	"testing"
)

func sample() *Resume {
	return &Resume{
		Profile:     Profile{FullName: "Aman Choudhary", Headline: "Full-Stack Engineer", Summary: "Builds ERPs.", Email: "a@b.c", Links: []Link{{Label: "GitHub", URL: "https://github.com/x"}}},
		Experience:  []Experience{{Role: "Engineer", Company: "PME Global", Period: "2025 – Present", Highlights: []string{"Shipped CRM"}, Technologies: []string{"Go", "Next.js"}}},
		Education:   []Education{{Institution: "SGL Bihani", Degree: "BCA", Period: "2021 – 2024"}},
		SkillGroups: []SkillGroup{{Category: "Backend", Skills: []string{"Go", "PostgreSQL"}}},
		Projects:    []Project{{Title: "OPA Real Estate", Type: "web-app", Summary: "Property platform", Technologies: []string{"Go"}}},
		Options:     DefaultOptions(),
		Accent:      "#0E7C66",
		SiteURL:     "https://developerchoudhary.com",
	}
}

func TestAllTemplatesRender(t *testing.T) {
	for _, name := range Templates() {
		r := sample()
		r.Template = name
		html, err := ResumeHTML(r)
		if err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		for _, want := range []string{"Aman Choudhary", "PME Global", "PostgreSQL", "<!doctype html>"} {
			if !strings.Contains(strings.ToLower(html), strings.ToLower(want)) {
				t.Fatalf("%s: missing %q", name, want)
			}
		}
	}
	if _, err := ResumeFooterHTML(sample()); err != nil {
		t.Fatalf("footer: %v", err)
	}
	r := sample()
	r.Template = "nope"
	if _, err := ResumeHTML(r); err == nil {
		t.Fatal("unknown template must fail")
	}
}
