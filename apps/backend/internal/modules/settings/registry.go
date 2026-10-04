package settings

import (
	"encoding/json"
	"fmt"
	"net/url"
	"strings"
)

// Kind is the JSON shape a setting value must have.
type Kind string

const (
	KindString Kind = "string" // one line of text
	KindText   Kind = "text"   // a short paragraph
	KindURL    Kind = "url"    // an absolute http(s) URL, or empty
	KindBool   Kind = "bool"
	KindLink   Kind = "link" // {"label": "...", "href": "..."}
	KindList   Kind = "list" // ["...", "..."]
)

// Keys read by the backend itself.
const (
	KeySiteName        = "site.name"
	KeyResponseTime    = "contact.responseTime"
	KeyFeatureReviews  = "features.reviews"
	KeyThemeActive     = "theme.active"
	maxListItems       = 30
	maxListItemLength  = 60
	maxLinkLabelLength = 40
)

// Link is the value of a KindLink setting.
type Link struct {
	Label string `json:"label"`
	Href  string `json:"href"`
}

// Definition describes one setting the public site reads. The registry is the whole
// schema: the API rejects keys that are not listed, and missing values fall back to Default.
type Definition struct {
	Key         string `json:"key"`
	Kind        Kind   `json:"kind"`
	Label       string `json:"label"`
	Description string `json:"description"`
	Default     any    `json:"default"`
	MaxLength   int    `json:"maxLength,omitempty"`
	// Hidden settings are owned by another module (which validates them) and are not part of the
	// settings form, the bulk update endpoint or the public settings map.
	Hidden bool `json:"-"`
}

type Group struct {
	Key         string       `json:"key"`
	Label       string       `json:"label"`
	Description string       `json:"description"`
	Items       []Definition `json:"items"`
}

// Registry lists every setting, grouped the way the admin settings page shows them.
var Registry = []Group{
	{
		Key: "brand", Label: "Brand & SEO", Description: "How the site is named and how it appears in search results and link previews.",
		Items: []Definition{
			{Key: KeySiteName, Kind: KindString, MaxLength: 60, Default: "Developer Choudhary",
				Label: "Site name", Description: "Shown in the header and footer, page titles, emails and share images."},
			{Key: "seo.defaultTitle", Kind: KindString, MaxLength: 70, Default: "Developer Choudhary · Full-stack developer",
				Label: "Home page title", Description: "The title of the home page in search results and browser tabs."},
			{Key: "seo.defaultDescription", Kind: KindText, MaxLength: 200,
				Default: "Aman Choudhary is a full-stack developer building fast websites, ERP systems and CRM portals with Next.js, Go and PostgreSQL.",
				Label:   "Default description", Description: "Used in search results and link previews when a page has no description of its own."},
			{Key: "seo.keywords", Kind: KindList, Default: []string{"web developer India", "Next.js developer", "Golang developer", "ERP development", "CRM development"},
				Label: "Keywords", Description: "One per line."},
			{Key: "seo.twitterHandle", Kind: KindString, MaxLength: 40, Default: "@developer_jaat",
				Label: "X (Twitter) handle", Description: "Credited on link previews, for example @developer_jaat."},
		},
	},
	{
		Key: "home", Label: "Home page", Description: "The two buttons under your introduction.",
		Items: []Definition{
			{Key: "hero.ctaPrimary", Kind: KindLink, Default: Link{Label: "Hire me", Href: "/contact"},
				Label: "Main button", Description: "Also used at the end of most pages."},
			{Key: "hero.ctaSecondary", Kind: KindLink, Default: Link{Label: "View my work", Href: "/work"},
				Label: "Second button"},
		},
	},
	{
		Key: "cta", Label: "Call to action", Description: "The closing block at the bottom of most pages.",
		Items: []Definition{
			{Key: "cta.title", Kind: KindString, MaxLength: 80, Default: "Have a project in mind?", Label: "Title"},
			{Key: "cta.text", Kind: KindText, MaxLength: 200,
				Default: "Tell me what you are building. I reply personally, usually within a day.", Label: "Text"},
		},
	},
	{
		Key: "contact", Label: "Contact", Description: "The contact page and the reply sent to people who write to you.",
		Items: []Definition{
			{Key: KeyResponseTime, Kind: KindString, MaxLength: 60, Default: "within one working day",
				Label: "Reply time", Description: "Completes “I reply …” on the contact page and in the automatic reply email."},
			{Key: "contact.calendarUrl", Kind: KindURL, Default: "",
				Label: "Booking link", Description: "Optional Cal.com or Calendly link. Adds a “Book a call” button."},
		},
	},
	{
		Key: "footer", Label: "Footer",
		Items: []Definition{
			{Key: "footer.note", Kind: KindString, MaxLength: 160, Default: "",
				Label: "Footer note", Description: "Optional line next to the copyright."},
		},
	},
	{
		Key: "theme", Label: "Theme",
		Items: []Definition{
			{Key: KeyThemeActive, Kind: KindString, MaxLength: 80, Default: "powder", Hidden: true,
				Label: "Active theme", Description: "Set on the Theme page."},
		},
	},
	{
		Key: "features", Label: "Features", Description: "Turn whole sections of the site on or off.",
		Items: []Definition{
			{Key: "features.blog", Kind: KindBool, Default: true, Label: "Blog", Description: "The blog, its articles and the RSS feed."},
			{Key: KeyFeatureReviews, Kind: KindBool, Default: true, Label: "Reviews",
				Description: "The reviews page, the testimonial on the home page and new review submissions."},
			{Key: "features.resume", Kind: KindBool, Default: true, Label: "Resume", Description: "The resume page and download buttons."},
			{Key: "features.locationConsent", Kind: KindBool, Default: true, Label: "Ask for location",
				Description: "Ask visitors whether they want to share their location."},
		},
	},
}

var byKey = func() map[string]Definition {
	out := map[string]Definition{}
	for _, g := range Registry {
		for _, d := range g.Items {
			out[d.Key] = d
		}
	}
	return out
}()

// Lookup returns the definition of a key.
func Lookup(key string) (Definition, bool) {
	d, ok := byKey[key]
	return d, ok
}

// DefaultJSON is the default value encoded as JSON.
func (d Definition) DefaultJSON() json.RawMessage {
	raw, _ := json.Marshal(d.Default)
	return raw
}

// Normalize validates a value against the definition and returns it trimmed and re-encoded.
func (d Definition) Normalize(raw json.RawMessage) (json.RawMessage, error) {
	switch d.Kind {
	case KindString, KindText, KindURL:
		var s string
		if err := json.Unmarshal(raw, &s); err != nil {
			return nil, fmt.Errorf("%s must be text", d.Label)
		}
		s = strings.TrimSpace(s)
		if d.Kind != KindText {
			s = strings.Join(strings.Fields(s), " ")
		}
		if d.MaxLength > 0 && len([]rune(s)) > d.MaxLength {
			return nil, fmt.Errorf("%s must be at most %d characters", d.Label, d.MaxLength)
		}
		if d.Kind == KindURL && s != "" && !isAbsoluteURL(s) {
			return nil, fmt.Errorf("%s must be a full https:// link", d.Label)
		}
		return json.Marshal(s)
	case KindBool:
		var b bool
		if err := json.Unmarshal(raw, &b); err != nil {
			return nil, fmt.Errorf("%s must be on or off", d.Label)
		}
		return json.Marshal(b)
	case KindLink:
		var l Link
		if err := json.Unmarshal(raw, &l); err != nil {
			return nil, fmt.Errorf("%s must have a label and a link", d.Label)
		}
		l.Label, l.Href = strings.TrimSpace(l.Label), strings.TrimSpace(l.Href)
		if l.Label == "" || len([]rune(l.Label)) > maxLinkLabelLength {
			return nil, fmt.Errorf("%s needs a label of 1 to %d characters", d.Label, maxLinkLabelLength)
		}
		if !strings.HasPrefix(l.Href, "/") && !isAbsoluteURL(l.Href) &&
			!strings.HasPrefix(l.Href, "mailto:") && !strings.HasPrefix(l.Href, "tel:") {
			return nil, fmt.Errorf("%s must link to a page such as /contact, or a full https:// address", d.Label)
		}
		return json.Marshal(l)
	case KindList:
		var items []string
		if err := json.Unmarshal(raw, &items); err != nil {
			return nil, fmt.Errorf("%s must be a list of text", d.Label)
		}
		out := make([]string, 0, len(items))
		for _, it := range items {
			if it = strings.TrimSpace(it); it == "" {
				continue
			}
			if len([]rune(it)) > maxListItemLength {
				return nil, fmt.Errorf("%s: %q is longer than %d characters", d.Label, it, maxListItemLength)
			}
			out = append(out, it)
		}
		if len(out) > maxListItems {
			return nil, fmt.Errorf("%s can have at most %d entries", d.Label, maxListItems)
		}
		return json.Marshal(out)
	}
	return nil, fmt.Errorf("unknown kind %q", d.Kind)
}

func isAbsoluteURL(s string) bool {
	u, err := url.Parse(s)
	return err == nil && (u.Scheme == "https" || u.Scheme == "http") && u.Host != ""
}
