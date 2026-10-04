package resumes

import (
	"context"
	"encoding/base64"
	htmltemplate "html/template"
	"io"
	"strings"
	"time"

	"portfolio-backend/internal/config"
	"portfolio-backend/internal/modules/profile"
	"portfolio-backend/internal/modules/skills"
	"portfolio-backend/internal/render"
	"portfolio-backend/pkg/httputil"
)

var categoryLabels = map[string]string{
	"frontend": "Frontend", "backend": "Backend", "database": "Databases", "devops": "DevOps & Infrastructure",
	"cloud": "Cloud", "tools": "Tools", "design": "Design", "other": "Other",
}

func (s *Service) build(ctx context.Context, template, accent string, opts render.Options) (*render.Resume, error) {
	p, err := s.Profile.GetModel(ctx)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, httputil.BadRequest("fill in your profile before generating a resume")
	}
	xps, err := s.Experience.PublishedModels(ctx)
	if err != nil {
		return nil, err
	}
	edus, err := s.Education.PublishedModels(ctx)
	if err != nil {
		return nil, err
	}
	certs, err := s.Certifications.PublishedModels(ctx)
	if err != nil {
		return nil, err
	}
	sks, err := s.Skills.PublishedModels(ctx)
	if err != nil {
		return nil, err
	}
	prjs, err := s.Projects.PublishedModels(ctx, true, opts.MaxProjects)
	if err != nil {
		return nil, err
	}
	if len(prjs) == 0 {
		if prjs, err = s.Projects.PublishedModels(ctx, false, opts.MaxProjects); err != nil {
			return nil, err
		}
	}

	summary := strings.TrimSpace(opts.CustomSummary)
	if summary == "" {
		summary = strings.TrimSpace(p.ResumeSummary)
	}
	if summary == "" {
		summary = p.BioShort
	}

	r := &render.Resume{
		Profile: render.Profile{
			FullName: p.FullName,
			Headline: p.Headline,
			Summary:  summary,
			Email:    p.Email,
			Phone:    p.Phone,
			Website:  strings.TrimPrefix(strings.TrimPrefix(config.SiteURL(), "https://"), "http://"),
			Location: joinNonEmpty(", ", p.LocationCity, p.LocationRegion, p.LocationCountry),
			Links:    profileLinks(p),
		},
		Stats:       render.Stats{YearsExperience: p.YearsExperience, ProjectsCompleted: p.ProjectsCompleted, ClientsServed: p.ClientsServed},
		Options:     opts,
		Template:    template,
		Accent:      accent,
		GeneratedAt: time.Now().UTC().Format("Jan 2006"),
		SiteURL:     r0(config.SiteURL()),
	}
	if opts.IncludePhoto && p.AvatarURL != "" {
		r.Profile.AvatarSrc = s.avatarDataURI(ctx, p.AvatarFileID)
	}
	for i, x := range xps {
		if opts.MaxExperience > 0 && i >= opts.MaxExperience {
			break
		}
		r.Experience = append(r.Experience, render.Experience{
			Role:         x.Role,
			Company:      x.Company,
			CompanyURL:   x.CompanyURL,
			Period:       period(&x.StartedAt, x.EndedAt, x.IsCurrent),
			Location:     locationLabel(x.Location, x.IsRemote),
			Type:         x.EmploymentType,
			Summary:      x.Summary,
			Highlights:   pick(x.Achievements, x.Responsibilities),
			Technologies: x.Technologies,
		})
	}
	for _, e := range edus {
		r.Education = append(r.Education, render.Education{
			Institution: e.Institution, Degree: e.Degree, Field: e.Field,
			Period: period(e.StartedAt, e.EndedAt, false), Grade: e.Grade, Description: e.Description,
		})
	}
	for _, c := range certs {
		date := ""
		if c.IssuedAt != nil {
			date = c.IssuedAt.Format("Jan 2006")
		}
		r.Certifications = append(r.Certifications, render.Certification{Name: c.Name, Issuer: c.Issuer, Date: date, URL: c.CredentialURL})
	}
	r.SkillGroups = groupSkills(sks)
	for _, pr := range prjs {
		url := pr.LiveURL
		if url == "" {
			url = pr.RepoURL
		}
		r.Projects = append(r.Projects, render.Project{
			Title: pr.Title, Type: pr.ProjectType, Summary: firstNonEmpty(pr.Summary, pr.Subtitle), URL: url, Technologies: pr.Technologies,
		})
	}
	return r, nil
}

func (s *Service) avatarDataURI(ctx context.Context, fileID *string) htmltemplate.URL {
	if fileID == nil || *fileID == "" {
		return ""
	}
	file, err := s.Files.GetFile(ctx, *fileID)
	if err != nil {
		return ""
	}
	obj, err := s.Files.OpenObject(ctx, file.ObjectKey)
	if err != nil {
		return ""
	}
	defer obj.Close()
	raw, err := io.ReadAll(io.LimitReader(obj, 3<<20))
	if err != nil || len(raw) == 0 {
		return ""
	}
	return htmltemplate.URL("data:" + file.ContentType + ";base64," + base64.StdEncoding.EncodeToString(raw))
}

func groupSkills(items []*skills.Skill) []render.SkillGroup {
	byCat := map[string][]string{}
	for _, s := range items {
		byCat[s.Category] = append(byCat[s.Category], s.Name)
	}
	out := make([]render.SkillGroup, 0, len(skills.Categories))
	for _, cat := range skills.Categories {
		if list := byCat[cat]; len(list) > 0 {
			out = append(out, render.SkillGroup{Category: categoryLabels[cat], Skills: list})
		}
	}
	return out
}

func period(start, end *time.Time, current bool) string {
	if start == nil {
		return ""
	}
	from := start.Format("Jan 2006")
	switch {
	case current:
		return from + " – Present"
	case end != nil:
		return from + " – " + end.Format("Jan 2006")
	default:
		return from
	}
}

func locationLabel(loc string, remote bool) string {
	if remote {
		return joinNonEmpty(" · ", loc, "Remote")
	}
	return loc
}

func pick(primary, fallback []string) []string {
	if len(primary) > 0 {
		return primary
	}
	return fallback
}

func profileLinks(p *profile.Profile) []render.Link {
	dto := profile.ToResponse(p)
	out := make([]render.Link, 0, len(dto.Socials))
	for _, s := range dto.Socials {
		out = append(out, render.Link{Label: s.Label, URL: s.URL})
	}
	return out
}

func joinNonEmpty(sep string, parts ...string) string {
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return strings.Join(out, sep)
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if strings.TrimSpace(v) != "" {
			return v
		}
	}
	return ""
}

func r0(s string) string { return strings.TrimRight(s, "/") }
