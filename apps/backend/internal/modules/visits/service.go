package visits

import (
	"context"
	"strings"
	"time"

	"portfolio-backend/internal/config"
	"portfolio-backend/pkg/pagination"
	"portfolio-backend/pkg/utils"

	"github.com/uptrace/bun"
)

const retention = 400 * 24 * time.Hour

type Service struct {
	repo Repository
}

func NewService(db *bun.DB) *Service {
	return &Service{repo: NewRepository(db)}
}

type ClientInfo struct {
	IP        string
	UserAgent string
	Country   string
}

func (s *Service) Track(ctx context.Context, req *TrackRequest, client ClientInfo) error {
	if strings.HasPrefix(req.Path, "/admin") || strings.HasPrefix(req.Path, "/api") {
		return nil
	}
	item := &Visit{
		VisitorID:       strings.TrimSpace(req.VisitorID),
		SessionID:       strings.TrimSpace(req.SessionID),
		Path:            utils.Truncate(strings.TrimSpace(req.Path), 300),
		Referrer:        utils.Truncate(strings.TrimSpace(req.Referrer), 500),
		UserAgent:       utils.Truncate(client.UserAgent, 400),
		Device:          req.Device,
		IPHash:          hashIP(client.IP),
		Country:         client.Country,
		Timezone:        strings.TrimSpace(req.Timezone),
		ConsentLocation: req.ConsentLocation,
		DurationMs:      req.DurationMs,
	}
	if req.ConsentLocation {
		item.Latitude = req.Latitude
		item.Longitude = req.Longitude
		item.LocationAccuracy = req.Accuracy
		item.City = strings.TrimSpace(req.City)
		item.Region = strings.TrimSpace(req.Region)
		if c := strings.TrimSpace(req.Country); c != "" {
			item.Country = c
		}
	}
	return s.repo.Create(ctx, item)
}

func (s *Service) List(ctx context.Context, query *pagination.ListQuery) ([]*ResponseDTO, *pagination.Response, error) {
	items, total, err := s.repo.List(ctx, query)
	if err != nil {
		return nil, nil, err
	}
	return ToListResponse(items), pagination.NewResponse(&query.Request, total), nil
}

func (s *Service) Stats(ctx context.Context) (*StatsDTO, error) {
	return s.repo.Stats(ctx)
}

func (s *Service) Prune(ctx context.Context) (int64, error) {
	return s.repo.DeleteOlderThan(ctx, time.Now().UTC().Add(-retention))
}

func hashIP(ip string) string {
	if ip == "" {
		return ""
	}
	return utils.SHA256Hex(ip + "|" + config.GetEnvOrDefault("JWT_SECRET", "salt"))[:32]
}
