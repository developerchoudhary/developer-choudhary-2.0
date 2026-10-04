package auth

import (
	"context"
	"strings"
	"time"

	"portfolio-backend/internal/audit"
	"portfolio-backend/internal/config"
	"portfolio-backend/internal/modules/users"
	"portfolio-backend/pkg/authz"
	"portfolio-backend/pkg/httputil"
	"portfolio-backend/pkg/utils"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Service struct {
	users    users.Repository
	sessions SessionRepository
	db       *bun.DB
}

func NewService(userRepo users.Repository, sessionRepo SessionRepository, db *bun.DB) *Service {
	return &Service{users: userRepo, sessions: sessionRepo, db: db}
}

func AccessTokenTTL() time.Duration {
	return time.Duration(config.GetEnvInt("ACCESS_TOKEN_TTL_MINUTES", 15)) * time.Minute
}

func RefreshTokenTTL() time.Duration {
	return time.Duration(config.GetEnvInt("REFRESH_TOKEN_TTL_DAYS", 30)) * 24 * time.Hour
}

type ClientInfo struct {
	UserAgent string
	IP        string
}

func (s *Service) Login(ctx context.Context, req *LoginRequest, client ClientInfo) (*TokenResponse, error) {
	user, err := s.users.GetByEmail(ctx, req.Email)
	if err != nil {
		// constant-time-ish failure: still hash compare against a dummy
		utils.CheckPassword("$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalid", req.Password)
		return nil, httputil.Unauthorized("Invalid email or password")
	}
	if !user.IsActive {
		return nil, httputil.Unauthorized("This account is disabled")
	}
	if !utils.CheckPassword(user.PasswordHash, req.Password) {
		return nil, httputil.Unauthorized("Invalid email or password")
	}

	refreshToken, err := utils.RandomToken(32)
	if err != nil {
		return nil, err
	}
	session := &Session{
		UserID:           user.ID,
		RefreshTokenHash: utils.SHA256Hex(refreshToken),
		UserAgent:        utils.Truncate(client.UserAgent, 400),
		IPAddress:        client.IP,
		ExpiresAt:        time.Now().UTC().Add(RefreshTokenTTL()),
	}
	if err := s.sessions.Create(ctx, session); err != nil {
		return nil, err
	}
	_ = s.users.TouchLogin(ctx, user.ID)

	audit.Try(audit.WithUserID(audit.WithIPAddress(ctx, client.IP), user.ID.String()), s.db, audit.ActionLogin, "user", user.ID, map[string]any{"userAgent": session.UserAgent})

	return s.tokens(user, session.ID, refreshToken)
}

func (s *Service) Refresh(ctx context.Context, refreshToken string) (*TokenResponse, error) {
	refreshToken = strings.TrimSpace(refreshToken)
	if refreshToken == "" {
		return nil, httputil.Unauthorized("Refresh token required")
	}
	session, err := s.sessions.GetByTokenHash(ctx, utils.SHA256Hex(refreshToken))
	if err != nil {
		return nil, err
	}
	if time.Now().UTC().After(session.ExpiresAt) {
		_ = s.sessions.Revoke(ctx, session.ID)
		return nil, httputil.Unauthorized("Session expired, please sign in again")
	}
	user, err := s.users.Get(ctx, session.UserID)
	if err != nil || !user.IsActive {
		return nil, httputil.Unauthorized("This account is disabled")
	}

	// rotate refresh token on every use
	newToken, err := utils.RandomToken(32)
	if err != nil {
		return nil, err
	}
	expiresAt := time.Now().UTC().Add(RefreshTokenTTL())
	if err := s.sessions.Rotate(ctx, session.ID, utils.SHA256Hex(newToken), expiresAt); err != nil {
		return nil, err
	}
	return s.tokens(user, session.ID, newToken)
}

func (s *Service) Logout(ctx context.Context, sessionID string) error {
	id, err := uuid.Parse(sessionID)
	if err != nil {
		return nil
	}
	return s.sessions.Revoke(ctx, id)
}

func (s *Service) Me(ctx context.Context, userID uuid.UUID) (*users.ResponseDTO, error) {
	user, err := s.users.Get(ctx, userID)
	if err != nil {
		return nil, err
	}
	return users.ToResponse(user), nil
}

func (s *Service) ChangePassword(ctx context.Context, userID uuid.UUID, req *ChangePasswordRequest) error {
	user, err := s.users.Get(ctx, userID)
	if err != nil {
		return err
	}
	if !utils.CheckPassword(user.PasswordHash, req.CurrentPassword) {
		return httputil.BadRequest("current password is incorrect")
	}
	if err := utils.ValidatePasswordStrength(req.NewPassword); err != nil {
		return httputil.BadRequest(err.Error())
	}
	hash, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return httputil.BadRequest(err.Error())
	}
	user.PasswordHash = hash
	user.UpdatedBy = &userID
	if _, err := s.users.Update(ctx, user); err != nil {
		return err
	}
	// sign out every other device
	if err := s.sessions.RevokeAllForUser(ctx, userID); err != nil {
		return err
	}
	audit.Try(ctx, s.db, audit.ActionUpdate, "user", userID, map[string]any{"passwordChanged": true})
	return nil
}

func (s *Service) CleanupSessions(ctx context.Context) (int64, error) {
	return s.sessions.DeleteExpired(ctx)
}

func (s *Service) tokens(user *users.User, sessionID uuid.UUID, refreshToken string) (*TokenResponse, error) {
	permissions := authz.PermissionsForRole(user.Role)
	access, expiresAt, err := utils.IssueAccessToken(user.ID.String(), sessionID.String(), user.Role, permissions, AccessTokenTTL())
	if err != nil {
		return nil, err
	}
	return &TokenResponse{
		AccessToken:  access,
		TokenType:    "Bearer",
		ExpiresAt:    expiresAt.UTC().Format(time.RFC3339),
		RefreshToken: refreshToken,
		User:         users.ToResponse(user),
		Permissions:  permissions,
	}, nil
}
