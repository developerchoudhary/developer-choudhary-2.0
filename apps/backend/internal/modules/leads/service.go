package leads

import (
	"bytes"
	"context"
	"encoding/csv"
	"encoding/json"
	"strings"
	"time"

	"portfolio-backend/internal/audit"
	"portfolio-backend/internal/modules/notifications"
	"portfolio-backend/pkg/httputil"
	"portfolio-backend/pkg/pagination"
	"portfolio-backend/pkg/utils"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Service struct {
	repo     Repository
	db       *bun.DB
	notifier *notifications.Service
}

func NewService(repo Repository, db *bun.DB, notifier *notifications.Service) *Service {
	return &Service{repo: repo, db: db, notifier: notifier}
}

type ClientInfo struct {
	IP        string
	UserAgent string
	Country   string
}

func (s *Service) Submit(ctx context.Context, req *SubmitRequest, client ClientInfo) (*ResponseDTO, error) {
	if strings.TrimSpace(req.Email) == "" && strings.TrimSpace(req.Phone) == "" {
		return nil, httputil.BadRequest("please share an email or a phone number so I can reply")
	}
	spam := strings.TrimSpace(req.Nickname) != ""
	if !spam {
		recent, err := s.repo.CountRecentFromIP(ctx, client.IP, time.Now().UTC().Add(-time.Hour))
		if err != nil {
			return nil, err
		}
		spam = recent >= 5
	}

	utm, _ := json.Marshal(cleanUTM(req.UTM))
	item := &Lead{
		FirstName:       strings.TrimSpace(req.FirstName),
		LastName:        strings.TrimSpace(req.LastName),
		Email:           strings.ToLower(strings.TrimSpace(req.Email)),
		Phone:           strings.TrimSpace(req.Phone),
		Company:         strings.TrimSpace(req.Company),
		ServiceInterest: strings.TrimSpace(req.ServiceInterest),
		BudgetRange:     strings.TrimSpace(req.BudgetRange),
		Timeline:        strings.TrimSpace(req.Timeline),
		Message:         strings.TrimSpace(req.Message),
		SourcePage:      strings.TrimSpace(req.SourcePage),
		Referrer:        utils.Truncate(req.Referrer, 500),
		UTM:             utm,
		ConsentLocation: req.ConsentLocation,
		Country:         client.Country,
		IPAddress:       client.IP,
		UserAgent:       utils.Truncate(client.UserAgent, 400),
		Status:          "new",
		Priority:        "normal",
		IsSpam:          spam,
	}
	if spam {
		item.Status = "spam"
	}
	if req.ConsentLocation && req.Location != nil {
		item.Latitude = req.Location.Latitude
		item.Longitude = req.Location.Longitude
		item.LocationAccuracy = req.Location.Accuracy
		item.City = strings.TrimSpace(req.Location.City)
		item.Region = strings.TrimSpace(req.Location.Region)
		if c := strings.TrimSpace(req.Location.Country); c != "" {
			item.Country = c
		}
		item.Timezone = strings.TrimSpace(req.Location.Timezone)
	}
	if err := s.repo.Create(ctx, item); err != nil {
		return nil, err
	}
	if !spam && s.notifier != nil {
		if err := s.notifier.LeadReceived(ctx, notifications.LeadPayload{
			ID:              item.ID,
			FirstName:       item.FirstName,
			LastName:        item.LastName,
			Email:           item.Email,
			Phone:           item.Phone,
			Company:         item.Company,
			ServiceInterest: item.ServiceInterest,
			BudgetRange:     item.BudgetRange,
			Timeline:        item.Timeline,
			Message:         item.Message,
			Location:        joinLocation(item.City, item.Region, item.Country),
			SourcePage:      item.SourcePage,
		}); err == nil {
			now := time.Now().UTC()
			item.NotifiedAt = &now
			_ = s.repo.Update(ctx, item)
		}
	}
	return ToResponse(item, false), nil
}

func (s *Service) List(ctx context.Context, query *pagination.ListQuery) ([]*ResponseDTO, *pagination.Response, error) {
	items, total, err := s.repo.List(ctx, query)
	if err != nil {
		return nil, nil, err
	}
	return ToListResponse(items), pagination.NewResponse(&query.Request, total), nil
}

func (s *Service) Get(ctx context.Context, id uuid.UUID) (*ResponseDTO, error) {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	return ToResponse(item, true), nil
}

func (s *Service) Update(ctx context.Context, id uuid.UUID, req *UpdateRequest, actor uuid.UUID) (*ResponseDTO, error) {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	if item.Status == "new" && req.Status != "new" && item.ContactedAt == nil {
		item.ContactedAt = &now
	}
	switch req.Status {
	case "won", "lost", "spam":
		if item.ClosedAt == nil {
			item.ClosedAt = &now
		}
	default:
		item.ClosedAt = nil
	}
	item.Status = req.Status
	item.IsSpam = req.Status == "spam"
	item.Priority = req.Priority
	item.UpdatedBy = &actor
	if err := s.repo.Update(ctx, item); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionUpdate, "lead", item.ID, map[string]any{"status": item.Status, "priority": item.Priority})
	return ToResponse(item, true), nil
}

func (s *Service) AddNote(ctx context.Context, id uuid.UUID, req *NoteRequest, actor uuid.UUID) (*ResponseDTO, error) {
	if _, err := s.repo.Get(ctx, id); err != nil {
		return nil, err
	}
	if err := s.repo.AddNote(ctx, &Note{LeadID: id, Body: strings.TrimSpace(req.Body), CreatedBy: &actor}); err != nil {
		return nil, err
	}
	return s.Get(ctx, id)
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID, actor uuid.UUID) error {
	if err := s.repo.SoftDelete(ctx, id, actor); err != nil {
		return err
	}
	audit.Try(ctx, s.db, audit.ActionDelete, "lead", id, nil)
	return nil
}

func (s *Service) Stats(ctx context.Context) (*StatsDTO, error) {
	return s.repo.Stats(ctx)
}

func (s *Service) Recent(ctx context.Context, limit int) ([]*ResponseDTO, error) {
	items, err := s.repo.Recent(ctx, limit)
	if err != nil {
		return nil, err
	}
	return ToListResponse(items), nil
}

func (s *Service) ExportCSV(ctx context.Context, query *pagination.ListQuery) ([]byte, error) {
	items, err := s.repo.All(ctx, query)
	if err != nil {
		return nil, err
	}
	var buf bytes.Buffer
	w := csv.NewWriter(&buf)
	_ = w.Write([]string{"Created", "Status", "Priority", "First name", "Last name", "Email", "Phone", "Company", "Service", "Budget", "Timeline", "City", "Region", "Country", "Source page", "Message"})
	for _, l := range items {
		_ = w.Write([]string{
			l.CreatedAt.UTC().Format(time.RFC3339), l.Status, l.Priority, l.FirstName, l.LastName, l.Email, l.Phone,
			l.Company, l.ServiceInterest, l.BudgetRange, l.Timeline, l.City, l.Region, l.Country, l.SourcePage, l.Message,
		})
	}
	w.Flush()
	return buf.Bytes(), w.Error()
}

func cleanUTM(in map[string]string) map[string]string {
	out := map[string]string{}
	for k, v := range in {
		k, v = strings.TrimSpace(k), strings.TrimSpace(v)
		if strings.HasPrefix(k, "utm_") && v != "" && len(out) < 10 {
			out[k] = utils.Truncate(v, 200)
		}
	}
	return out
}

func joinLocation(parts ...string) string {
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return strings.Join(out, ", ")
}
