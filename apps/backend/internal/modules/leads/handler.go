package leads

import (
	"net/http"
	"time"

	md "portfolio-backend/internal/middleware"
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

func (h *Handler) Submit(c *gin.Context) {
	req := &SubmitRequest{}
	if err := c.ShouldBindJSON(req); err != nil {
		httputil.WriteValidationError(c, err)
		return
	}
	item, err := h.service.Submit(c.Request.Context(), req, ClientInfo{
		IP:        md.ClientIP(c),
		UserAgent: c.Request.UserAgent(),
		Country:   md.CountryHint(c),
	})
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusCreated, "Thanks! I will get back to you within one working day.", gin.H{"id": item.ID})
}

func (h *Handler) List(c *gin.Context) {
	query := pagination.ParseList(c, ListSchema)
	items, meta, err := h.service.List(c.Request.Context(), query)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WritePaginated(c, "Leads fetched successfully", items, meta)
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
	httputil.WriteSuccess(c, http.StatusOK, "Lead fetched successfully", item)
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
	req := &UpdateRequest{}
	if err := c.ShouldBindJSON(req); err != nil {
		httputil.WriteValidationError(c, err)
		return
	}
	item, err := h.service.Update(c.Request.Context(), id, req, actor)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Lead updated successfully", item)
}

func (h *Handler) AddNote(c *gin.Context) {
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
	req := &NoteRequest{}
	if err := c.ShouldBindJSON(req); err != nil {
		httputil.WriteValidationError(c, err)
		return
	}
	item, err := h.service.AddNote(c.Request.Context(), id, req, actor)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusCreated, "Note added", item)
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
	httputil.WriteSuccess(c, http.StatusOK, "Lead deleted successfully", nil)
}

func (h *Handler) Stats(c *gin.Context) {
	stats, err := h.service.Stats(c.Request.Context())
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Lead stats fetched successfully", stats)
}

func (h *Handler) ExportCSV(c *gin.Context) {
	query := pagination.ParseList(c, ListSchema)
	data, err := h.service.ExportCSV(c.Request.Context(), query)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	c.Header("Content-Disposition", `attachment; filename="leads-`+time.Now().UTC().Format("2006-01-02")+`.csv"`)
	c.Data(http.StatusOK, "text/csv; charset=utf-8", data)
}
