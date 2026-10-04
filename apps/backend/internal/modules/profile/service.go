package profile

import (
	"context"
	"encoding/json"
	"strings"

	"portfolio-backend/internal/audit"
	"portfolio-backend/internal/revalidate"

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

func (s *Service) Get(ctx context.Context) (*ResponseDTO, error) {
	p, err := s.repo.Get(ctx)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return &ResponseDTO{Socials: []SocialLink{}, AvailabilityStatus: "available", Timezone: "Asia/Kolkata"}, nil
	}
	return ToResponse(p), nil
}

func (s *Service) GetModel(ctx context.Context) (*Profile, error) {
	return s.repo.Get(ctx)
}

func (s *Service) Update(ctx context.Context, req *UpdateRequest, actor uuid.UUID) (*ResponseDTO, error) {
	socials := req.Socials
	if socials == nil {
		socials = []SocialLink{}
	}
	socialsJSON, err := json.Marshal(socials)
	if err != nil {
		return nil, err
	}
	p := &Profile{
		FullName:           strings.TrimSpace(req.FullName),
		Headline:           strings.TrimSpace(req.Headline),
		BioShort:           strings.TrimSpace(req.BioShort),
		BioLong:            strings.TrimSpace(req.BioLong),
		Email:              strings.ToLower(strings.TrimSpace(req.Email)),
		Phone:              strings.TrimSpace(req.Phone),
		Whatsapp:           strings.TrimSpace(req.Whatsapp),
		LocationCity:       strings.TrimSpace(req.LocationCity),
		LocationRegion:     strings.TrimSpace(req.LocationRegion),
		LocationCountry:    strings.TrimSpace(req.LocationCountry),
		Timezone:           strings.TrimSpace(req.Timezone),
		AvatarFileID:       req.AvatarFileID,
		AvatarURL:          strings.TrimSpace(req.AvatarURL),
		AvailabilityStatus: req.AvailabilityStatus,
		AvailabilityNote:   strings.TrimSpace(req.AvailabilityNote),
		YearsExperience:    req.YearsExperience,
		ProjectsCompleted:  req.ProjectsCompleted,
		ClientsServed:      req.ClientsServed,
		Socials:            socialsJSON,
		ResumeSummary:      strings.TrimSpace(req.ResumeSummary),
		UpdatedBy:          &actor,
	}
	if p.Timezone == "" {
		p.Timezone = "Asia/Kolkata"
	}
	updated, err := s.repo.Upsert(ctx, p)
	if err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionUpdate, "profile", SingletonID, req)
	s.reval.Async("site", "resume")
	return ToResponse(updated), nil
}
