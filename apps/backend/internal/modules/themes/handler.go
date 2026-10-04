package themes

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
	data, err := h.service.List(c.Request.Context())
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Themes fetched successfully", data)
}

func (h *Handler) Preview(c *gin.Context) {
	def := Definition{}
	if err := c.ShouldBindJSON(&def); err != nil {
		httputil.WriteValidationError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Theme previewed", h.service.Preview(def))
}

func (h *Handler) Create(c *gin.Context) {
	actor, err := uuid.Parse(c.GetString("user_id"))
	if err != nil {
		httputil.WriteBadRequest(c, err)
		return
	}
	req := &RequestDTO{}
	if err := c.ShouldBindJSON(req); err != nil {
		httputil.WriteValidationError(c, err)
		return
	}
	item, err := h.service.Create(c.Request.Context(), req, actor)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusCreated, "Theme created successfully", item)
}

func (h *Handler) Update(c *gin.Context) {
	actor, err := uuid.Parse(c.GetString("user_id"))
	if err != nil {
		httputil.WriteBadRequest(c, err)
		return
	}
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		httputil.WriteBadRequest(c, err)
		return
	}
	req := &RequestDTO{}
	if err := c.ShouldBindJSON(req); err != nil {
		httputil.WriteValidationError(c, err)
		return
	}
	item, err := h.service.Update(c.Request.Context(), id, req, actor)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Theme updated successfully", item)
}

func (h *Handler) Delete(c *gin.Context) {
	actor, err := uuid.Parse(c.GetString("user_id"))
	if err != nil {
		httputil.WriteBadRequest(c, err)
		return
	}
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		httputil.WriteBadRequest(c, err)
		return
	}
	if err := h.service.Delete(c.Request.Context(), id, actor); err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Theme deleted successfully", nil)
}

func (h *Handler) Activate(c *gin.Context) {
	actor, err := uuid.Parse(c.GetString("user_id"))
	if err != nil {
		httputil.WriteBadRequest(c, err)
		return
	}
	req := &ActivateRequest{}
	if err := c.ShouldBindJSON(req); err != nil {
		httputil.WriteValidationError(c, err)
		return
	}
	data, err := h.service.Activate(c.Request.Context(), req.Slug, actor)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Theme activated", data)
}
