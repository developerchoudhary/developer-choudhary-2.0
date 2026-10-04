package auth

import (
	"net/http"
	"strings"

	"portfolio-backend/internal/config"
	md "portfolio-backend/internal/middleware"
	"portfolio-backend/pkg/httputil"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const RefreshCookieName = "dc_refresh"

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Login(c *gin.Context) {
	req := &LoginRequest{}
	if err := c.ShouldBindJSON(req); err != nil {
		httputil.WriteValidationError(c, err)
		return
	}
	tokens, err := h.service.Login(c.Request.Context(), req, ClientInfo{
		UserAgent: c.Request.UserAgent(),
		IP:        md.ClientIP(c),
	})
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	h.setRefreshCookie(c, tokens.RefreshToken)
	httputil.WriteSuccess(c, http.StatusOK, "Signed in successfully", tokens)
}

func (h *Handler) Refresh(c *gin.Context) {
	token := ""
	if cookie, err := c.Cookie(RefreshCookieName); err == nil {
		token = cookie
	}
	if token == "" && c.Request.ContentLength != 0 {
		req := &RefreshRequest{}
		if err := c.ShouldBindJSON(req); err == nil {
			token = req.RefreshToken
		}
	}
	tokens, err := h.service.Refresh(c.Request.Context(), token)
	if err != nil {
		h.clearRefreshCookie(c)
		httputil.WriteError(c, err)
		return
	}
	h.setRefreshCookie(c, tokens.RefreshToken)
	httputil.WriteSuccess(c, http.StatusOK, "Token refreshed", tokens)
}

func (h *Handler) Logout(c *gin.Context) {
	_ = h.service.Logout(c.Request.Context(), c.GetString("session_id"))
	h.clearRefreshCookie(c)
	httputil.WriteSuccess(c, http.StatusOK, "Signed out", nil)
}

func (h *Handler) Me(c *gin.Context) {
	userID, err := uuid.Parse(c.GetString("user_id"))
	if err != nil {
		httputil.WriteBadRequest(c, err)
		return
	}
	user, err := h.service.Me(c.Request.Context(), userID)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	auth, _ := md.GetAuth(c)
	httputil.WriteSuccess(c, http.StatusOK, "Profile fetched", gin.H{
		"user":        user,
		"permissions": auth.Permissions,
	})
}

func (h *Handler) ChangePassword(c *gin.Context) {
	userID, err := uuid.Parse(c.GetString("user_id"))
	if err != nil {
		httputil.WriteBadRequest(c, err)
		return
	}
	req := &ChangePasswordRequest{}
	if err := c.ShouldBindJSON(req); err != nil {
		httputil.WriteValidationError(c, err)
		return
	}
	if err := h.service.ChangePassword(c.Request.Context(), userID, req); err != nil {
		httputil.WriteError(c, err)
		return
	}
	h.clearRefreshCookie(c)
	httputil.WriteSuccess(c, http.StatusOK, "Password updated, please sign in again", nil)
}

func (h *Handler) setRefreshCookie(c *gin.Context, token string) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		RefreshCookieName,
		token,
		int(RefreshTokenTTL().Seconds()),
		"/api/v1/admin/auth",
		strings.TrimSpace(config.GetEnvOrDefault("COOKIE_DOMAIN", "")),
		config.GetEnvBool("COOKIE_SECURE", false),
		true,
	)
}

func (h *Handler) clearRefreshCookie(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(RefreshCookieName, "", -1, "/api/v1/admin/auth", strings.TrimSpace(config.GetEnvOrDefault("COOKIE_DOMAIN", "")), config.GetEnvBool("COOKIE_SECURE", false), true)
}
