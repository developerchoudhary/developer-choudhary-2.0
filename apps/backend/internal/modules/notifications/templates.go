package notifications

import (
	"bytes"
	htmltemplate "html/template"
	"regexp"
	"strings"
	"sync"

	htmltemplates "portfolio-backend/internal/templates"
)

var (
	tmplOnce sync.Once
	tmpl     *htmltemplate.Template
	tmplErr  error
	tagRe    = regexp.MustCompile(`<[^>]+>`)
	spaceRe  = regexp.MustCompile(`\n{3,}`)
)

func templates() (*htmltemplate.Template, error) {
	tmplOnce.Do(func() {
		tmpl, tmplErr = htmltemplate.New("email").Funcs(htmltemplate.FuncMap{
			"stars": func(n int) string { return strings.Repeat("★", n) + strings.Repeat("☆", 5-n) },
		}).ParseFS(htmltemplates.FS, "email/*.html")
	})
	return tmpl, tmplErr
}

// render executes the named template and derives a plain-text alternative from the HTML.
func render(name string, data any) (html string, text string, err error) {
	t, err := templates()
	if err != nil {
		return "", "", err
	}
	var buf bytes.Buffer
	if err := t.ExecuteTemplate(&buf, name, data); err != nil {
		return "", "", err
	}
	html = buf.String()
	return html, toText(html), nil
}

func toText(html string) string {
	s := strings.NewReplacer("</p>", "\n\n", "<br>", "\n", "<br/>", "\n", "</li>", "\n", "</h1>", "\n\n", "</h2>", "\n\n", "</tr>", "\n").Replace(html)
	s = tagRe.ReplaceAllString(s, "")
	s = htmltemplate.HTMLEscapeString("") + strings.TrimSpace(spaceRe.ReplaceAllString(s, "\n\n"))
	return strings.NewReplacer("&amp;", "&", "&lt;", "<", "&gt;", ">", "&#39;", "'", "&#34;", `"`, "&nbsp;", " ").Replace(s)
}
