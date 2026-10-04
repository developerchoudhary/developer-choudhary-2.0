package notifications

import (
	"context"
	"fmt"
	"strings"
	"time"

	"portfolio-backend/internal/config"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Service struct {
	repo Repository
}

func NewService(db *bun.DB) *Service {
	return &Service{repo: NewRepository(db)}
}

type LeadPayload struct {
	ID              uuid.UUID
	FirstName       string
	LastName        string
	Email           string
	Phone           string
	Company         string
	ServiceInterest string
	BudgetRange     string
	Timeline        string
	Message         string
	Location        string
	SourcePage      string
}

type ReviewPayload struct {
	ID         uuid.UUID
	AuthorName string
	Company    string
	Rating     int
	Title      string
	Body       string
}

type baseData struct {
	SiteName string
	SiteURL  string
	AdminURL string
	Year     int
}

func base() baseData {
	site := config.SiteURL()
	return baseData{
		SiteName: config.GetEnvOrDefault("SITE_NAME", "Developer Choudhary"),
		SiteURL:  site,
		AdminURL: site + "/admin",
		Year:     time.Now().Year(),
	}
}

func (s *Service) Stats(ctx context.Context) (*StatsDTO, error) {
	return s.repo.Stats(ctx)
}

func (s *Service) Retry(ctx context.Context, id uuid.UUID) error {
	return s.repo.Retry(ctx, id)
}

// LeadReceived queues the admin alert and, when the visitor left an email, an auto-reply.
func (s *Service) LeadReceived(ctx context.Context, p LeadPayload) error {
	admin := strings.TrimSpace(config.GetEnvOrDefault("NOTIFY_EMAIL", ""))
	items := make([]*Outbox, 0, 2)
	name := strings.TrimSpace(p.FirstName + " " + p.LastName)
	data := struct {
		baseData
		Lead LeadPayload
		Name string
	}{base(), p, name}

	if admin != "" {
		html, text, err := render("lead_admin.html", data)
		if err != nil {
			return err
		}
		items = append(items, &Outbox{
			ToEmail:    admin,
			ReplyTo:    p.Email,
			Subject:    fmt.Sprintf("New lead: %s%s", name, suffix(p.ServiceInterest)),
			HTMLBody:   html,
			TextBody:   text,
			Template:   "lead_admin",
			EntityName: "lead",
			EntityID:   &p.ID,
		})
	}
	if strings.TrimSpace(p.Email) != "" {
		html, text, err := render("lead_autoreply.html", data)
		if err != nil {
			return err
		}
		items = append(items, &Outbox{
			ToEmail:    p.Email,
			ReplyTo:    admin,
			Subject:    "Thanks for reaching out, " + p.FirstName,
			HTMLBody:   html,
			TextBody:   text,
			Template:   "lead_autoreply",
			EntityName: "lead",
			EntityID:   &p.ID,
		})
	}
	return s.repo.Enqueue(ctx, items...)
}

func (s *Service) ReviewReceived(ctx context.Context, p ReviewPayload) error {
	admin := strings.TrimSpace(config.GetEnvOrDefault("NOTIFY_EMAIL", ""))
	if admin == "" {
		return nil
	}
	data := struct {
		baseData
		Review ReviewPayload
	}{base(), p}
	html, text, err := render("review_admin.html", data)
	if err != nil {
		return err
	}
	return s.repo.Enqueue(ctx, &Outbox{
		ToEmail:    admin,
		Subject:    fmt.Sprintf("New %d-star review from %s", p.Rating, p.AuthorName),
		HTMLBody:   html,
		TextBody:   text,
		Template:   "review_admin",
		EntityName: "review",
		EntityID:   &p.ID,
	})
}

func suffix(s string) string {
	if strings.TrimSpace(s) == "" {
		return ""
	}
	return " · " + s
}
