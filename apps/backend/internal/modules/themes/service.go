package themes

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"portfolio-backend/internal/audit"
	"portfolio-backend/internal/modules/settings"
	"portfolio-backend/internal/revalidate"
	"portfolio-backend/pkg/httputil"
	"portfolio-backend/pkg/slug"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Service struct {
	repo     Repository
	db       *bun.DB
	reval    *revalidate.Client
	settings *settings.Service
}

func NewService(repo Repository, db *bun.DB, reval *revalidate.Client, st *settings.Service) *Service {
	return &Service{repo: repo, db: db, reval: reval, settings: st}
}

func builtinDTO(p Preset, active string) ThemeDTO {
	r := Resolve(p.Definition)
	return ThemeDTO{Slug: p.Slug, Builtin: true, Active: p.Slug == active, Definition: p.Definition,
		Tokens: r.Tokens, CSS: r.CSS, Version: r.Version, Issues: issuesOrEmpty(r.Issues)}
}

func customDTO(t *Theme, active string) ThemeDTO {
	r := Resolve(t.definition())
	id := t.ID.String()
	return ThemeDTO{ID: &id, Slug: t.Slug, Active: t.Slug == active, Definition: t.definition(),
		Tokens: r.Tokens, CSS: r.CSS, Version: r.Version, Issues: issuesOrEmpty(r.Issues)}
}

func (s *Service) activeSlug(ctx context.Context) string {
	return s.settings.String(ctx, settings.KeyThemeActive)
}

// List returns the built-in themes, then the custom ones, with the active one marked.
func (s *Service) List(ctx context.Context) (*ListDTO, error) {
	customs, err := s.repo.List(ctx)
	if err != nil {
		return nil, err
	}
	active := s.Active(ctx).Slug
	out := &ListDTO{Active: active, Surfaces: surfaceList(), Themes: make([]ThemeDTO, 0, len(Presets)+len(customs))}
	for _, p := range Presets {
		out.Themes = append(out.Themes, builtinDTO(p, active))
	}
	for _, t := range customs {
		out.Themes = append(out.Themes, customDTO(t, active))
	}
	return out, nil
}

// Preview resolves an unsaved definition so the admin can show it before saving.
func (s *Service) Preview(def Definition) *PreviewDTO {
	r := Resolve(def)
	return &PreviewDTO{Tokens: r.Tokens, CSS: r.CSS, Issues: issuesOrEmpty(r.Issues)}
}

// Active is the theme the site uses: the chosen one, or the default if it is missing or unreadable.
func (s *Service) Active(ctx context.Context) *ActiveDTO {
	slugValue := s.activeSlug(ctx)
	def, found := Definition{}, false
	if p, ok := presetBySlug(slugValue); ok {
		def, found = p.Definition, true
	} else if t, err := s.repo.GetBySlug(ctx, slugValue); err == nil {
		def, found = t.definition(), true
	}
	if found {
		if r := Resolve(def); len(r.Issues) == 0 {
			return &ActiveDTO{Slug: slugValue, Name: def.Name, Version: r.Version, CSS: r.CSS, Tokens: r.Tokens}
		}
	}
	p := defaultPreset()
	r := Resolve(p.Definition)
	return &ActiveDTO{Slug: p.Slug, Name: p.Definition.Name, Version: r.Version, CSS: r.CSS, Tokens: r.Tokens}
}

// Activate makes a built-in or custom theme the one the site uses.
func (s *Service) Activate(ctx context.Context, slugValue string, actor uuid.UUID) (*ActiveDTO, error) {
	slugValue = strings.TrimSpace(slugValue)
	def := Definition{}
	if p, ok := presetBySlug(slugValue); ok {
		def = p.Definition
	} else {
		t, err := s.repo.GetBySlug(ctx, slugValue)
		if err != nil {
			return nil, err
		}
		def = t.definition()
	}
	if r := Resolve(def); len(r.Issues) > 0 {
		return nil, httputil.BadRequest("this theme has readability problems: " + r.Issues[0].Message)
	}
	if err := s.settings.Set(ctx, settings.KeyThemeActive, slugValue, actor); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionUpdate, "theme", uuid.Nil, map[string]any{"active": slugValue})
	s.reval.Async("site")
	return s.Active(ctx), nil
}

func (s *Service) Create(ctx context.Context, req *RequestDTO, actor uuid.UUID) (*ThemeDTO, error) {
	item := &Theme{}
	if err := s.apply(ctx, item, req); err != nil {
		return nil, err
	}
	item.Touch(actor)
	if err := s.repo.Create(ctx, item); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionCreate, "theme", item.ID, map[string]any{"slug": item.Slug, "name": item.Name})
	dto := customDTO(item, s.Active(ctx).Slug)
	return &dto, nil
}

func (s *Service) Update(ctx context.Context, id uuid.UUID, req *RequestDTO, actor uuid.UUID) (*ThemeDTO, error) {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	wasActive := item.Slug == s.activeSlug(ctx)
	if err := s.apply(ctx, item, req); err != nil {
		return nil, err
	}
	item.Touch(actor)
	if err := s.repo.Update(ctx, item); err != nil {
		return nil, err
	}
	if wasActive {
		// The slug follows the name; keep the site pointing at this theme.
		if err := s.settings.Set(ctx, settings.KeyThemeActive, item.Slug, actor); err != nil {
			return nil, err
		}
		s.reval.Async("site")
	}
	audit.Try(ctx, s.db, audit.ActionUpdate, "theme", item.ID, map[string]any{"slug": item.Slug, "name": item.Name})
	dto := customDTO(item, s.Active(ctx).Slug)
	return &dto, nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID, actor uuid.UUID) error {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return err
	}
	if item.Slug == s.activeSlug(ctx) {
		return httputil.BadRequest("this theme is in use; choose another theme before deleting it")
	}
	if err := s.repo.SoftDelete(ctx, id, actor); err != nil {
		return err
	}
	audit.Try(ctx, s.db, audit.ActionDelete, "theme", id, map[string]any{"slug": item.Slug})
	return nil
}

// apply validates a request and copies it onto the model, giving it a unique slug.
func (s *Service) apply(ctx context.Context, item *Theme, req *RequestDTO) error {
	def := req.definition()
	def.Name = strings.Join(strings.Fields(def.Name), " ")
	def.Description = strings.TrimSpace(def.Description)
	for _, c := range []*string{&def.LogoFrom, &def.LogoTo, &def.Backdrop, &def.Light.Accent, &def.Light.ButtonFrom, &def.Light.ButtonTo,
		&def.Light.Highlight, &def.Dark.Accent, &def.Dark.ButtonFrom, &def.Dark.ButtonTo, &def.Dark.Highlight} {
		*c = strings.ToLower(strings.TrimSpace(*c))
	}
	if r := Resolve(def); len(r.Issues) > 0 {
		msgs := make([]string, 0, len(r.Issues))
		for _, i := range r.Issues {
			msgs = append(msgs, i.Message)
		}
		return httputil.BadRequest(strings.Join(msgs, " "))
	}
	slugValue, err := s.uniqueSlug(ctx, def.Name, item.ID)
	if err != nil {
		return err
	}
	item.Slug, item.Name, item.Description, item.Surface = slugValue, def.Name, def.Description, def.Surface
	item.LogoFrom, item.LogoTo, item.Backdrop = def.LogoFrom, def.LogoTo, def.Backdrop
	item.Light, item.Dark = def.Light, def.Dark
	return nil
}

// uniqueSlug derives a slug from the name that clashes with neither a built-in nor another custom theme.
func (s *Service) uniqueSlug(ctx context.Context, name string, exclude uuid.UUID) (string, error) {
	base := slug.Make(name)
	if base == "" {
		base = "theme"
	}
	for i := 1; i < 100; i++ {
		candidate := base
		if i > 1 {
			candidate = fmt.Sprintf("%s-%d", base, i)
		}
		if _, builtin := presetBySlug(candidate); builtin {
			continue
		}
		taken, err := s.repo.SlugTaken(ctx, candidate, exclude)
		if err != nil {
			return "", err
		}
		if !taken {
			return candidate, nil
		}
	}
	return "", errors.New("could not find a free slug for " + name)
}
