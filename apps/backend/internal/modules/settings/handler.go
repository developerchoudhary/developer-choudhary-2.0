package settings

import (
	"net/http"

	"portfolio-backend/pkg/httputil"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) List(c *gin.Context) {
	items, err := h.service.Groups(c.Request.Context())
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Settings fetched successfully", items)
}

func (h *Handler) BulkUpdate(c *gin.Context) {
	actor, err := uuid.Parse(c.GetString("user_id"))
	if err != nil {
		httputil.WriteBadRequest(c, err)
		return
	}
	req := &BulkUpdateRequest{}
	if err := c.ShouldBindJSON(req); err != nil {
		httputil.WriteValidationError(c, err)
		return
	}
	items, err := h.service.BulkUpdate(c.Request.Context(), req, actor)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Settings updated successfully", items)
}
