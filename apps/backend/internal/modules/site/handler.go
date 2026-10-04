package site

import (
	"net/http"

	"portfolio-backend/pkg/httputil"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Bundle(c *gin.Context) {
	data, err := h.service.Bundle(c.Request.Context())
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Site fetched successfully", data)
}

func (h *Handler) Sitemap(c *gin.Context) {
	data, err := h.service.Sitemap(c.Request.Context())
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Sitemap fetched successfully", data)
}
