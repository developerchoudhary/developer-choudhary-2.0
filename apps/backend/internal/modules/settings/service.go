package settings

import (
	"context"
	"encoding/json"
	"time"

	"portfolio-backend/internal/audit"
	"portfolio-backend/internal/revalidate"
	"portfolio-backend/pkg/httputil"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Service struct {
	repo  Repository
	db    *bun.DB
	reval *revalidate.Client
}

func NewService(repo Repository, db *bun.DB, reval *revalidate.Client) *Service {
	return &Service{repo: repo, db: db, reval: reval}
}

// stored returns the saved rows by key, ignoring keys that are no longer in the registry.
func (s *Service) stored(ctx context.Context) (map[string]*Setting, error) {
	items, err := s.repo.List(ctx)
	if err != nil {
		return nil, err
	}
	out := make(map[string]*Setting, len(items))
	for _, it := range items {
		if _, ok := Lookup(it.Key); ok {
			out[it.Key] = it
		}
	}
	return out, nil
}

// Groups returns every setting with its definition and current (or default) value.
func (s *Service) Groups(ctx context.Context) ([]GroupDTO, error) {
	have, err := s.stored(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]GroupDTO, 0, len(Registry))
	for _, g := range Registry {
		group := GroupDTO{Key: g.Key, Label: g.Label, Description: g.Description, Items: make([]FieldDTO, 0, len(g.Items))}
		for _, d := range g.Items {
			if d.Hidden {
				continue
			}
			field := FieldDTO{Definition: d, Value: d.DefaultJSON()}
			if it, ok := have[d.Key]; ok {
				field.Value = it.Value
				at := it.UpdatedAt.UTC().Format(time.RFC3339)
				field.UpdatedAt = &at
			}
			group.Items = append(group.Items, field)
		}
		if len(group.Items) > 0 {
			out = append(out, group)
		}
	}
	return out, nil
}

// PublicMap returns {key: value} for every setting, falling back to defaults, for the site bundle.
func (s *Service) PublicMap(ctx context.Context) (map[string]json.RawMessage, error) {
	have, err := s.stored(ctx)
	if err != nil {
		return nil, err
	}
	out := make(map[string]json.RawMessage, len(byKey))
	for key, d := range byKey {
		if d.Hidden {
			continue
		}
		if it, ok := have[key]; ok {
			out[key] = it.Value
		} else {
			out[key] = d.DefaultJSON()
		}
	}
	return out, nil
}

func (s *Service) value(ctx context.Context, key string, dest any) {
	d, ok := Lookup(key)
	if !ok {
		return
	}
	raw := d.DefaultJSON()
	if have, err := s.stored(ctx); err == nil {
		if it, ok := have[key]; ok {
			raw = it.Value
		}
	}
	_ = json.Unmarshal(raw, dest)
}

// String returns a text setting, or its default.
func (s *Service) String(ctx context.Context, key string) string {
	var v string
	s.value(ctx, key, &v)
	return v
}

// Enabled returns a feature switch, or its default.
func (s *Service) Enabled(ctx context.Context, key string) bool {
	var v bool
	s.value(ctx, key, &v)
	return v
}

// Set stores one value for another module (used for hidden keys such as the active theme).
// The caller validates what the value means; this only checks its shape.
func (s *Service) Set(ctx context.Context, key string, value any, actor uuid.UUID) error {
	d, ok := Lookup(key)
	if !ok {
		return httputil.BadRequest("unknown setting: " + key)
	}
	raw, err := json.Marshal(value)
	if err != nil {
		return err
	}
	normalized, err := d.Normalize(raw)
	if err != nil {
		return httputil.BadRequest(err.Error())
	}
	return s.repo.Upsert(ctx, []*Setting{{Key: d.Key, Value: normalized, UpdatedBy: &actor}})
}

func (s *Service) BulkUpdate(ctx context.Context, req *BulkUpdateRequest, actor uuid.UUID) ([]GroupDTO, error) {
	items := make([]*Setting, 0, len(req.Items))
	for _, it := range req.Items {
		d, ok := Lookup(it.Key)
		if !ok || d.Hidden {
			return nil, httputil.BadRequest("unknown setting: " + it.Key)
		}
		value, err := d.Normalize(it.Value)
		if err != nil {
			return nil, httputil.BadRequest(err.Error())
		}
		items = append(items, &Setting{Key: d.Key, Value: value, UpdatedBy: &actor})
	}
	if err := s.repo.Upsert(ctx, items); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionUpdate, "settings", uuid.Nil, req.Items)
	s.reval.Async("site")
	return s.Groups(ctx)
}
