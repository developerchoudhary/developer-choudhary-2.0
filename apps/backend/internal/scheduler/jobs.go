package scheduler

import (
	"context"
	"log"
	"time"

	"portfolio-backend/internal/modules/auth"
	"portfolio-backend/internal/modules/posts"
	"portfolio-backend/internal/modules/users"
	"portfolio-backend/internal/modules/visits"
	"portfolio-backend/internal/revalidate"

	"github.com/uptrace/bun"
)

type Jobs struct {
	posts  *posts.Service
	auth   *auth.Service
	visits *visits.Service
}

func New(db *bun.DB) *Jobs {
	rv := revalidate.New()
	return &Jobs{
		posts:  posts.NewService(posts.NewRepository(db), db, rv),
		auth:   auth.NewService(users.NewRepository(db), auth.NewSessionRepository(db), db),
		visits: visits.NewService(db),
	}
}

func (j *Jobs) PublishScheduledPosts() {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()
	if _, err := j.posts.PublishScheduled(ctx); err != nil {
		log.Printf("publish scheduled posts failed: %v", err)
	}
}

func (j *Jobs) CleanupSessions() {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()
	n, err := j.auth.CleanupSessions(ctx)
	if err != nil {
		log.Printf("cleanup sessions failed: %v", err)
		return
	}
	if n > 0 {
		log.Printf("removed %d expired session(s)", n)
	}
}

func (j *Jobs) PruneVisits() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()
	n, err := j.visits.Prune(ctx)
	if err != nil {
		log.Printf("prune visits failed: %v", err)
		return
	}
	if n > 0 {
		log.Printf("pruned %d old visit(s)", n)
	}
}
