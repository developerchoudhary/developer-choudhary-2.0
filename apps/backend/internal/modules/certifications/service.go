package certifications

import (
	"context"
	"strings"

	"portfolio-backend/internal/audit"
	"portfolio-backend/internal/revalidate"
	"portfolio-backend/pkg/dateparse"
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

func (s *Service) List(ctx context.Context) ([]*ResponseDTO, error) {
	items, err := s.repo.List(ctx, false)
	if err != nil {
		return nil, err
	}
	return ToListResponse(items), nil
}

func (s *Service) PublicList(ctx context.Context) ([]*ResponseDTO, error) {
	items, err := s.repo.List(ctx, true)
	if err != nil {
		return nil, err
	}
	return ToListResponse(items), nil
}

func (s *Service) PublishedModels(ctx context.Context) ([]*Certification, error) {
	return s.repo.List(ctx, true)
}

func (s *Service) Create(ctx context.Context, req *RequestDTO, actor uuid.UUID) (*ResponseDTO, error) {
	item := &Certification{IsPublished: true}
	if err := apply(item, req); err != nil {
		return nil, err
	}
	item.Touch(actor)
	if err := s.repo.Create(ctx, item); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionCreate, "certification", item.ID, req)
	s.reval.Async("certifications", "site", "resume")
	return ToResponse(item), nil
}

func (s *Service) Update(ctx context.Context, id uuid.UUID, req *RequestDTO, actor uuid.UUID) (*ResponseDTO, error) {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if err := apply(item, req); err != nil {
		return nil, err
	}
	item.Touch(actor)
	if err := s.repo.Update(ctx, item); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionUpdate, "certification", item.ID, req)
	s.reval.Async("certifications", "site", "resume")
	return ToResponse(item), nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID, actor uuid.UUID) error {
	if err := s.repo.SoftDelete(ctx, id, actor); err != nil {
		return err
	}
	audit.Try(ctx, s.db, audit.ActionDelete, "certification", id, nil)
	s.reval.Async("certifications", "site", "resume")
	return nil
}

func apply(item *Certification, req *RequestDTO) error {
	issued, err := dateparse.ParseOptional(req.IssuedAt)
	if err != nil {
		return httputil.BadRequest("issuedAt: " + err.Error())
	}
	expires, err := dateparse.ParseOptional(req.ExpiresAt)
	if err != nil {
		return httputil.BadRequest("expiresAt: " + err.Error())
	}
	item.Name = strings.TrimSpace(req.Name)
	item.Issuer = strings.TrimSpace(req.Issuer)
	item.IssuedAt = issued
	item.ExpiresAt = expires
	item.CredentialID = strings.TrimSpace(req.CredentialID)
	item.CredentialURL = strings.TrimSpace(req.CredentialURL)
	item.SortOrder = req.SortOrder
	if req.IsPublished != nil {
		item.IsPublished = *req.IsPublished
	}
	return nil
}
