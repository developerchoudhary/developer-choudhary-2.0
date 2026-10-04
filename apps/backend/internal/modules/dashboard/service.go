package dashboard

import (
	"context"

	"portfolio-backend/internal/modules/leads"
	"portfolio-backend/internal/modules/notifications"
	"portfolio-backend/internal/modules/posts"
	"portfolio-backend/internal/modules/projects"
	"portfolio-backend/internal/modules/reviews"
	"portfolio-backend/internal/modules/visits"

	"github.com/uptrace/bun"
)

type Service struct {
	db            *bun.DB
	leads         *leads.Service
	reviews       *reviews.Service
	visits        *visits.Service
	notifications *notifications.Service
}

func NewService(db *bun.DB, l *leads.Service, r *reviews.Service, v *visits.Service, n *notifications.Service) *Service {
	return &Service{db: db, leads: l, reviews: r, visits: v, notifications: n}
}

type ContentCounts struct {
	PostsPublished    int `json:"postsPublished"`
	PostsDraft        int `json:"postsDraft"`
	PostsScheduled    int `json:"postsScheduled"`
	ProjectsPublished int `json:"projectsPublished"`
}

type DTO struct {
	Leads          *leads.StatsDTO         `json:"leads"`
	RecentLeads    []*leads.ResponseDTO    `json:"recentLeads"`
	ReviewsPending int                     `json:"reviewsPending"`
	Visits         *visits.StatsDTO        `json:"visits"`
	Content        ContentCounts           `json:"content"`
	Outbox         *notifications.StatsDTO `json:"outbox"`
}

func (s *Service) Overview(ctx context.Context) (*DTO, error) {
	out := &DTO{}
	var err error
	if out.Leads, err = s.leads.Stats(ctx); err != nil {
		return nil, err
	}
	if out.RecentLeads, err = s.leads.Recent(ctx, 6); err != nil {
		return nil, err
	}
	if out.ReviewsPending, err = s.reviews.CountPending(ctx); err != nil {
		return nil, err
	}
	if out.Visits, err = s.visits.Stats(ctx); err != nil {
		return nil, err
	}
	if out.Outbox, err = s.notifications.Stats(ctx); err != nil {
		return nil, err
	}
	if out.Content, err = s.content(ctx); err != nil {
		return nil, err
	}
	return out, nil
}

func (s *Service) content(ctx context.Context) (ContentCounts, error) {
	var c ContentCounts
	count := func(status string) (int, error) {
		return s.db.NewSelect().Model((*posts.Post)(nil)).Where("deleted_at IS NULL").Where("status = ?", status).Count(ctx)
	}
	var err error
	if c.PostsPublished, err = count(posts.StatusPublished); err != nil {
		return c, err
	}
	if c.PostsDraft, err = count(posts.StatusDraft); err != nil {
		return c, err
	}
	if c.PostsScheduled, err = count(posts.StatusScheduled); err != nil {
		return c, err
	}
	c.ProjectsPublished, err = s.db.NewSelect().Model((*projects.Project)(nil)).Where("deleted_at IS NULL").Where("is_published = TRUE").Count(ctx)
	return c, err
}
