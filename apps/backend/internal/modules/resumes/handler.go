package resumes

import (
	"net/http"

	"portfolio-backend/internal/render"
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

func (h *Handler) Templates(c *gin.Context) {
	httputil.WriteSuccess(c, http.StatusOK, "Templates fetched", gin.H{
		"templates":      render.Templates(),
		"defaultOptions": render.DefaultOptions(),
		"defaultAccent":  h.service.DefaultAccent(c.Request.Context()),
	})
}

func (h *Handler) Preview(c *gin.Context) {
	req := &GenerateRequest{}
	if err := c.ShouldBindJSON(req); err != nil {
		httputil.WriteValidationError(c, err)
		return
	}
	html, err := h.service.Preview(c.Request.Context(), req)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	c.Header("Content-Security-Policy", "default-src 'none'; img-src data: https:; style-src 'unsafe-inline'; font-src data:")
	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
}

func (h *Handler) Generate(c *gin.Context) {
	actor, err := uuid.Parse(c.GetString("user_id"))
	if err != nil {
		httputil.WriteBadRequest(c, err)
		return
	}
	req := &GenerateRequest{}
	if err := c.ShouldBindJSON(req); err != nil {
		httputil.WriteValidationError(c, err)
		return
	}
	item, err := h.service.Generate(c.Request.Context(), req, actor)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusCreated, "Resume generated successfully", item)
}

func (h *Handler) List(c *gin.Context) {
	items, err := h.service.List(c.Request.Context())
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Resumes fetched successfully", items)
}

func (h *Handler) SetCurrent(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		httputil.WriteBadRequest(c, err)
		return
	}
	item, err := h.service.SetCurrent(c.Request.Context(), id)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Resume is now live", item)
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
	httputil.WriteSuccess(c, http.StatusOK, "Resume deleted", nil)
}

func (h *Handler) PublicDownload(c *gin.Context) {
	url, err := h.service.DownloadURL(c.Request.Context())
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	c.Redirect(http.StatusFound, url)
}
