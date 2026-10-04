package site

import (
	"context"
	"encoding/json"
	"time"

	"portfolio-backend/internal/modules/posts"
	"portfolio-backend/internal/modules/profile"
	"portfolio-backend/internal/modules/projects"
	"portfolio-backend/internal/modules/resumes"
	"portfolio-backend/internal/modules/reviews"
	"portfolio-backend/internal/modules/services"
	"portfolio-backend/internal/modules/settings"
	"portfolio-backend/internal/modules/skills"
	"portfolio-backend/internal/modules/taglines"
)

type Service struct {
	profile  *profile.Service
	settings *settings.Service
	taglines *taglines.Service
	skills   *skills.Service
	reviews  *reviews.Service
	projects *projects.Service
	posts    *posts.Service
	services *services.Svc
	resumes  *resumes.Service
}

func NewService(p *profile.Service, st *settings.Service, t *taglines.Service, sk *skills.Service, r *reviews.Service, pr *projects.Service, po *posts.Service, sv *services.Svc, re *resumes.Service) *Service {
	return &Service{profile: p, settings: st, taglines: t, skills: sk, reviews: r, projects: pr, posts: po, services: sv, resumes: re}
}

type Bundle struct {
	Profile  *profile.ResponseDTO       `json:"profile"`
	Settings map[string]json.RawMessage `json:"settings"`
	Taglines []taglines.PublicDTO       `json:"taglines"`
	Skills   []skills.GroupDTO          `json:"skills"`
	Reviews  *reviews.SummaryDTO        `json:"reviews"`
	Resume   *resumes.PublicDTO         `json:"resume"`
}

func (s *Service) Bundle(ctx context.Context) (*Bundle, error) {
	out := &Bundle{}
	var err error
	if out.Profile, err = s.profile.Get(ctx); err != nil {
		return nil, err
	}
	if out.Settings, err = s.settings.PublicMap(ctx); err != nil {
		return nil, err
	}
	if out.Taglines, err = s.taglines.PublicList(ctx); err != nil {
		return nil, err
	}
	if out.Skills, err = s.skills.PublicGroups(ctx); err != nil {
		return nil, err
	}
	if out.Reviews, err = s.reviews.Summary(ctx); err != nil {
		return nil, err
	}
	out.Resume, _ = s.resumes.Current(ctx)
	return out, nil
}

type Entry struct {
	Slug      string `json:"slug"`
	UpdatedAt string `json:"updatedAt"`
}

type Sitemap struct {
	Services   []Entry `json:"services"`
	Projects   []Entry `json:"projects"`
	Posts      []Entry `json:"posts"`
	Categories []Entry `json:"categories"`
	Tags       []Entry `json:"tags"`
}

func (s *Service) Sitemap(ctx context.Context) (*Sitemap, error) {
	out := &Sitemap{Services: []Entry{}, Projects: []Entry{}, Posts: []Entry{}, Categories: []Entry{}, Tags: []Entry{}}
	svcs, err := s.services.PublicList(ctx)
	if err != nil {
		return nil, err
	}
	for _, it := range svcs {
		out.Services = append(out.Services, Entry{Slug: it.Slug, UpdatedAt: it.UpdatedAt})
	}
	prjs, err := s.projects.PublishedModels(ctx, false, 0)
	if err != nil {
		return nil, err
	}
	for _, it := range prjs {
		out.Projects = append(out.Projects, Entry{Slug: it.Slug, UpdatedAt: it.UpdatedAt.UTC().Format(time.RFC3339)})
	}
	pst, err := s.posts.PublishedForSitemap(ctx)
	if err != nil {
		return nil, err
	}
	for _, it := range pst {
		out.Posts = append(out.Posts, Entry{Slug: it.Slug, UpdatedAt: it.UpdatedAt.UTC().Format(time.RFC3339)})
	}
	cats, err := s.posts.ListCategories(ctx)
	if err != nil {
		return nil, err
	}
	for _, it := range cats {
		if it.PostCount > 0 {
			out.Categories = append(out.Categories, Entry{Slug: it.Slug})
		}
	}
	tags, err := s.posts.ListTags(ctx)
	if err != nil {
		return nil, err
	}
	for _, it := range tags {
		if it.PostCount > 0 {
			out.Tags = append(out.Tags, Entry{Slug: it.Slug})
		}
	}
	return out, nil
}
