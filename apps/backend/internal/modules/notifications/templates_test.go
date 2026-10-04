package notifications

import (
	"strings"
	"testing"

	"github.com/google/uuid"
)

func TestEmailTemplatesRender(t *testing.T) {
	base := baseData{SiteName: "Developer Choudhary", SiteURL: "https://example.com", AdminURL: "https://example.com/admin", ResponseTime: "within two hours", Year: 2026,
		Accent: "#23648e", AccentFg: "#ffffff", BrandFrom: "#4f97c7", BrandTo: "#23648e"}
	lead := LeadPayload{ID: uuid.New(), FirstName: "Asha", Email: "asha@example.com", ServiceInterest: "ERP systems", Message: "We need an ERP."}
	leadData := struct {
		baseData
		Lead LeadPayload
		Name string
	}{base, lead, "Asha"}
	reviewData := struct {
		baseData
		Review ReviewPayload
	}{base, ReviewPayload{ID: uuid.New(), AuthorName: "Ravi", Rating: 5, Body: "Great work."}}

	cases := []struct {
		name string
		data any
		want []string
	}{
		{"lead_autoreply.html", leadData, []string{"Thanks, Asha", "reply within two hours", "We need an ERP.", "background:#23648e;color:#ffffff", "linear-gradient(90deg,#4f97c7,#23648e)"}},
		{"lead_admin.html", leadData, []string{"New lead from Asha", "ERP systems", "/admin/leads/"}},
		{"review_admin.html", reviewData, []string{"Ravi", "★★★★★", "/admin/reviews"}},
	}
	for _, c := range cases {
		html, text, err := render(c.name, c.data)
		if err != nil {
			t.Fatalf("%s: %v", c.name, err)
		}
		for _, w := range c.want {
			if !strings.Contains(html, w) {
				t.Errorf("%s: missing %q", c.name, w)
			}
		}
		if !strings.Contains(html, "Developer Choudhary") || strings.Contains(text, "<") {
			t.Errorf("%s: bad layout or text alternative", c.name)
		}
	}
}
