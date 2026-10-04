package render

import (
	"bytes"
	htmltemplate "html/template"
	"strings"
	"sync"

	htmltemplates "portfolio-backend/internal/templates"
	"portfolio-backend/pkg/httputil"
)

var templateNames = []string{"modern", "classic", "compact"}

type Link struct {
	Label string `json:"label"`
	URL   string `json:"url"`
}

type Profile struct {
	FullName  string           `json:"fullName"`
	Headline  string           `json:"headline"`
	Summary   string           `json:"summary"`
	Email     string           `json:"email"`
	Phone     string           `json:"phone"`
	Website   string           `json:"website"`
	Location  string           `json:"location"`
	Links     []Link           `json:"links"`
	AvatarSrc htmltemplate.URL `json:"avatarSrc,omitempty"`
}

type Experience struct {
	Role         string   `json:"role"`
	Company      string   `json:"company"`
	CompanyURL   string   `json:"companyUrl"`
	Period       string   `json:"period"`
	Location     string   `json:"location"`
	Type         string   `json:"type"`
	Summary      string   `json:"summary"`
	Highlights   []string `json:"highlights"`
	Technologies []string `json:"technologies"`
}

type Education struct {
	Institution string `json:"institution"`
	Degree      string `json:"degree"`
	Field       string `json:"field"`
	Period      string `json:"period"`
	Grade       string `json:"grade"`
	Description string `json:"description"`
}

type Certification struct {
	Name   string `json:"name"`
	Issuer string `json:"issuer"`
	Date   string `json:"date"`
	URL    string `json:"url"`
}

type SkillGroup struct {
	Category string   `json:"category"`
	Skills   []string `json:"skills"`
}

type Project struct {
	Title        string   `json:"title"`
	Type         string   `json:"type"`
	Summary      string   `json:"summary"`
	URL          string   `json:"url"`
	Technologies []string `json:"technologies"`
}

type Stats struct {
	YearsExperience   int `json:"yearsExperience"`
	ProjectsCompleted int `json:"projectsCompleted"`
	ClientsServed     int `json:"clientsServed"`
}

type Options struct {
	IncludeProjects       bool   `json:"includeProjects"`
	IncludeCertifications bool   `json:"includeCertifications"`
	IncludeEducation      bool   `json:"includeEducation"`
	IncludeStats          bool   `json:"includeStats"`
	IncludePhoto          bool   `json:"includePhoto"`
	MaxProjects           int    `json:"maxProjects"`
	MaxExperience         int    `json:"maxExperience"`
	CustomSummary         string `json:"customSummary"`
	TargetRole            string `json:"targetRole"`
}

func DefaultOptions() Options {
	return Options{IncludeProjects: true, IncludeCertifications: true, IncludeEducation: true, IncludeStats: true, MaxProjects: 4, MaxExperience: 6}
}

type Resume struct {
	Profile        Profile         `json:"profile"`
	Experience     []Experience    `json:"experience"`
	Education      []Education     `json:"education"`
	Certifications []Certification `json:"certifications"`
	SkillGroups    []SkillGroup    `json:"skillGroups"`
	Projects       []Project       `json:"projects"`
	Stats          Stats           `json:"stats"`
	Options        Options         `json:"options"`
	Template       string          `json:"template"`
	Accent         string          `json:"accent"`
	GeneratedAt    string          `json:"generatedAt"`
	SiteURL        string          `json:"siteUrl"`
}

func Templates() []string {
	return templateNames
}

func IsTemplate(name string) bool {
	for _, t := range templateNames {
		if t == name {
			return true
		}
	}
	return false
}

var (
	once sync.Once
	set  *htmltemplate.Template
	err  error
)

func templates() (*htmltemplate.Template, error) {
	once.Do(func() {
		set, err = htmltemplate.New("resume").Funcs(htmltemplate.FuncMap{
			"join": strings.Join,
			"css":  func(s string) htmltemplate.CSS { return htmltemplate.CSS(s) },
		}).ParseFS(htmltemplates.FS, "html/*.html")
	})
	return set, err
}

func ResumeHTML(r *Resume) (string, error) {
	if !IsTemplate(r.Template) {
		return "", httputil.BadRequest("unknown resume template")
	}
	return execute("resume_"+r.Template+".html", r)
}

func ResumeFooterHTML(r *Resume) (string, error) {
	return execute("resume_footer.html", r)
}

func execute(name string, data any) (string, error) {
	t, err := templates()
	if err != nil {
		return "", err
	}
	var buf bytes.Buffer
	if err := t.ExecuteTemplate(&buf, name, data); err != nil {
		return "", err
	}
	return buf.String(), nil
}
