package slug

import "testing"

func TestMake(t *testing.T) {
	cases := map[string]string{
		"Hello, World!":                  "hello-world",
		"  Next.js  &  Go   ERP  ":       "next-js-go-erp",
		"Crème Brûlée recipe":            "creme-brulee-recipe",
		"already-a-slug":                 "already-a-slug",
		"---weird___chars***":            "weird-chars",
		"Building CRMs in 2026: a guide": "building-crms-in-2026-a-guide",
	}
	for in, want := range cases {
		if got := Make(in); got != want {
			t.Errorf("Make(%q) = %q, want %q", in, got, want)
		}
	}
}
