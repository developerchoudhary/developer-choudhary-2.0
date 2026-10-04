package settings

import (
	"context"
	"encoding/json"
	"regexp"
	"strings"

	"portfolio-backend/internal/audit"
	"portfolio-backend/internal/revalidate"
	"portfolio-backend/pkg/httputil"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

var keyRe = regexp.MustCompile(`^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)*$`)

type Service struct {
	repo  Repository
	db    *bun.DB
	reval *revalidate.Client
}

func NewService(repo Repository, db *bun.DB, reval *revalidate.Client) *Service {
	return &Service{repo: repo, db: db, reval: reval}
}

func (s *Service) List(ctx context.Context) ([]*ResponseDTO, error) {
	items, err := s.repo.List(ctx, false)
	if err != nil {
		return nil, err
	}
	return ToListResponse(items), nil
}

func (s *Service) PublicMap(ctx context.Context) (map[string]json.RawMessage, error) {
	items, err := s.repo.List(ctx, true)
	if err != nil {
		return nil, err
	}
	return ToMap(items), nil
}

// String returns a string setting or the fallback.
func (s *Service) String(ctx context.Context, key, fallback string) string {
	item, err := s.repo.Get(ctx, key)
	if err != nil || item == nil {
		return fallback
	}
	var v string
	if err := json.Unmarshal(item.Value, &v); err != nil || strings.TrimSpace(v) == "" {
		return fallback
	}
	return v
}

func (s *Service) BulkUpdate(ctx context.Context, req *BulkUpdateRequest, actor uuid.UUID) ([]*ResponseDTO, error) {
	items := make([]*Setting, 0, len(req.Items))
	for _, it := range req.Items {
		key := strings.TrimSpace(it.Key)
		if !keyRe.MatchString(key) {
			return nil, httputil.BadRequest("invalid setting key: " + key)
		}
		if !json.Valid(it.Value) {
			return nil, httputil.BadRequest("invalid JSON value for " + key)
		}
		isPublic := true
		if it.IsPublic != nil {
			isPublic = *it.IsPublic
		} else if existing, err := s.repo.Get(ctx, key); err == nil && existing != nil {
			isPublic = existing.IsPublic
		}
		items = append(items, &Setting{
			Key:         key,
			Value:       it.Value,
			IsPublic:    isPublic,
			Description: strings.TrimSpace(it.Description),
			UpdatedBy:   &actor,
		})
	}
	if err := s.repo.Upsert(ctx, items); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionUpdate, "settings", uuid.Nil, req.Items)
	s.reval.Async("site")
	return s.List(ctx)
}
