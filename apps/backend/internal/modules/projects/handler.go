package projects

import (
	"net/http"
	"strconv"

	"portfolio-backend/pkg/httputil"
	"portfolio-backend/pkg/pagination"

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
	query := pagination.ParseList(c, ListSchema)
	items, meta, err := h.service.List(c.Request.Context(), query)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WritePaginated(c, "Projects fetched successfully", items, meta)
}

func (h *Handler) PublicList(c *gin.Context) {
	query := pagination.ParseList(c, ListSchema)
	items, meta, err := h.service.PublicList(c.Request.Context(), query)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WritePaginated(c, "Projects fetched successfully", items, meta)
}

func (h *Handler) PublicFeatured(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "6"))
	if limit <= 0 || limit > 24 {
		limit = 6
	}
	items, err := h.service.Featured(c.Request.Context(), limit)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Featured projects fetched successfully", items)
}

func (h *Handler) PublicFacets(c *gin.Context) {
	data, err := h.service.Facets(c.Request.Context())
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Project facets fetched successfully", data)
}

func (h *Handler) PublicGet(c *gin.Context) {
	item, err := h.service.PublicGetBySlug(c.Request.Context(), c.Param("slug"))
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Project fetched successfully", item)
}

func (h *Handler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		httputil.WriteBadRequest(c, err)
		return
	}
	item, err := h.service.Get(c.Request.Context(), id)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Project fetched successfully", item)
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
	httputil.WriteSuccess(c, http.StatusCreated, "Project created successfully", item)
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
	httputil.WriteSuccess(c, http.StatusOK, "Project updated successfully", item)
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
	httputil.WriteSuccess(c, http.StatusOK, "Project deleted successfully", nil)
}
