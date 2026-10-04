package users

import (
	"context"
	"strings"

	"portfolio-backend/internal/audit"
	"portfolio-backend/pkg/authz"
	"portfolio-backend/pkg/httputil"
	"portfolio-backend/pkg/utils"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Service struct {
	repo Repository
	db   *bun.DB
}

func NewService(repo Repository, db *bun.DB) *Service {
	return &Service{repo: repo, db: db}
}

func (s *Service) List(ctx context.Context) ([]*ResponseDTO, error) {
	items, err := s.repo.List(ctx)
	if err != nil {
		return nil, err
	}
	return ToListResponse(items), nil
}

func (s *Service) Get(ctx context.Context, id uuid.UUID) (*ResponseDTO, error) {
	u, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	return ToResponse(u), nil
}

func (s *Service) Create(ctx context.Context, req *CreateRequest, actor uuid.UUID) (*ResponseDTO, error) {
	if err := utils.ValidatePasswordStrength(req.Password); err != nil {
		return nil, httputil.BadRequest(err.Error())
	}
	hash, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, httputil.BadRequest(err.Error())
	}
	u := &User{
		Email:        strings.ToLower(strings.TrimSpace(req.Email)),
		PasswordHash: hash,
		Name:         strings.TrimSpace(req.Name),
		Role:         req.Role,
		IsActive:     true,
		CreatedBy:    &actor,
		UpdatedBy:    &actor,
	}
	created, err := s.repo.Create(ctx, u)
	if err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionCreate, "user", created.ID, map[string]any{"email": created.Email, "role": created.Role})
	return ToResponse(created), nil
}

func (s *Service) Update(ctx context.Context, id uuid.UUID, req *UpdateRequest, actor uuid.UUID) (*ResponseDTO, error) {
	u, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	u.Name = strings.TrimSpace(req.Name)
	u.Role = req.Role
	if req.IsActive != nil {
		if !*req.IsActive && u.ID == actor {
			return nil, httputil.BadRequest("you cannot deactivate your own account")
		}
		u.IsActive = *req.IsActive
	}
	if req.Password != nil && strings.TrimSpace(*req.Password) != "" {
		if err := utils.ValidatePasswordStrength(*req.Password); err != nil {
			return nil, httputil.BadRequest(err.Error())
		}
		hash, err := utils.HashPassword(*req.Password)
		if err != nil {
			return nil, httputil.BadRequest(err.Error())
		}
		u.PasswordHash = hash
	}
	u.UpdatedBy = &actor
	updated, err := s.repo.Update(ctx, u)
	if err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionUpdate, "user", updated.ID, map[string]any{"name": updated.Name, "role": updated.Role, "isActive": updated.IsActive})
	return ToResponse(updated), nil
}

// EnsureAdmin creates the first admin account when the users table is empty.
func (s *Service) EnsureAdmin(ctx context.Context, email, password, name string) (*User, bool, error) {
	count, err := s.repo.Count(ctx)
	if err != nil {
		return nil, false, err
	}
	if count > 0 {
		existing, err := s.repo.GetByEmail(ctx, email)
		if err != nil {
			return nil, false, nil
		}
		return existing, false, nil
	}
	hash, err := utils.HashPassword(password)
	if err != nil {
		return nil, false, err
	}
	u := &User{
		Email:        email,
		PasswordHash: hash,
		Name:         name,
		Role:         authz.RoleAdmin,
		IsActive:     true,
	}
	created, err := s.repo.Create(ctx, u)
	if err != nil {
		return nil, false, err
	}
	return created, true, nil
}
