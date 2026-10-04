package visits

import (
	"net/http"
	"strconv"

	md "portfolio-backend/internal/middleware"
	"portfolio-backend/pkg/httputil"
	"portfolio-backend/pkg/pagination"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Track(c *gin.Context) {
	req := &TrackRequest{}
	if err := c.ShouldBindJSON(req); err != nil {
		httputil.WriteValidationError(c, err)
		return
	}
	if req.VisitorID == "" {
		req.VisitorID = c.GetHeader("X-Visitor-ID")
	}
	if err := h.service.Track(c.Request.Context(), req, ClientInfo{
		IP:        md.ClientIP(c),
		UserAgent: c.Request.UserAgent(),
		Country:   md.CountryHint(c),
	}); err != nil {
		httputil.WriteError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *Handler) List(c *gin.Context) {
	query := pagination.ParseList(c, ListSchema)
	items, meta, err := h.service.List(c.Request.Context(), query)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WritePaginated(c, "Visits fetched successfully", items, meta)
}

func (h *Handler) Stats(c *gin.Context) {
	days, _ := strconv.Atoi(c.DefaultQuery("days", "30"))
	stats, err := h.service.Stats(c.Request.Context(), days)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Visit stats fetched successfully", stats)
}
