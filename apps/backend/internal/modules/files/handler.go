package files

import (
	"bytes"
	"io"
	"net/http"
	"strings"

	"portfolio-backend/internal/config"
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

func (h *Handler) Create(c *gin.Context) {
	userID, err := uuid.Parse(c.GetString("user_id"))
	if err != nil {
		httputil.WriteBadRequest(c, err)
		return
	}

	maxBytes := config.MaxUploadBytes()
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxBytes+1024)

	var req UploadRequest
	if err := c.ShouldBind(&req); err != nil {
		httputil.WriteValidationError(c, err)
		return
	}

	header, err := c.FormFile("file")
	if err != nil {
		httputil.WriteError(c, httputil.BadRequest("file is required"))
		return
	}
	if header.Size > maxBytes {
		httputil.WriteError(c, httputil.BadRequest("file exceeds the upload limit"))
		return
	}

	src, err := header.Open()
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	defer src.Close()

	sniff := make([]byte, 512)
	n, err := io.ReadFull(src, sniff)
	if err != nil && err != io.ErrUnexpectedEOF && err != io.EOF {
		httputil.WriteError(c, err)
		return
	}
	sniff = sniff[:n]

	var reader io.Reader
	if seeker, ok := src.(io.Seeker); ok {
		if _, err := seeker.Seek(0, io.SeekStart); err == nil {
			reader = src
		} else {
			reader = io.MultiReader(bytes.NewReader(sniff), src)
		}
	} else {
		reader = io.MultiReader(bytes.NewReader(sniff), src)
	}

	file, err := h.service.Create(c.Request.Context(), UploadInput{
		UserID:     userID,
		Visibility: req.Visibility,
		Folder:     req.Folder,
		AltText:    req.AltText,
		Filename:   header.Filename,
		Size:       header.Size,
		Reader:     reader,
		Sniff:      sniff,
	})
	if err != nil {
		httputil.WriteError(c, err)
		return
	}

	httputil.WriteSuccess(c, http.StatusCreated, "File uploaded successfully", file)
}

func (h *Handler) List(c *gin.Context) {
	query := pagination.ParseList(c, ListSchema)
	items, meta, err := h.service.List(c.Request.Context(), query)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WritePaginated(c, "Files fetched successfully", items, meta)
}

func (h *Handler) Folders(c *gin.Context) {
	folders, err := h.service.Folders(c.Request.Context())
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Folders fetched successfully", folders)
}

func (h *Handler) Update(c *gin.Context) {
	req := &UpdateRequest{}
	if err := c.ShouldBindJSON(req); err != nil {
		httputil.WriteValidationError(c, err)
		return
	}
	file, err := h.service.Update(c.Request.Context(), c.Param("id"), req)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "File updated successfully", file)
}

func (h *Handler) Delete(c *gin.Context) {
	userID, err := uuid.Parse(c.GetString("user_id"))
	if err != nil {
		httputil.WriteBadRequest(c, err)
		return
	}
	file, err := h.service.Delete(c.Request.Context(), c.Param("id"), userID)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "File deleted successfully", file)
}

func (h *Handler) Stream(c *gin.Context) {
	objectKey, err := ParseObjectKey(
		c.Param("category"),
		c.Param("year"),
		c.Param("month"),
		c.Param("day"),
		c.Param("name"),
	)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}

	file, err := h.service.GetForStream(c.Request.Context(), objectKey, md.ExtractBearerToken(c))
	if err != nil {
		httputil.WriteError(c, err)
		return
	}

	obj, err := h.service.OpenObject(c.Request.Context(), file.ObjectKey)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	defer obj.Close()

	c.Header("Content-Type", file.ContentType)
	c.Header("X-Content-Type-Options", "nosniff")
	if file.Visibility == VisibilityPublic {
		// object keys are immutable (ULID), so cache aggressively at the edge and browser
		c.Header("Cache-Control", "public, max-age=31536000, immutable")
	} else {
		c.Header("Cache-Control", "private, no-store")
	}
	if strings.EqualFold(c.Query("download"), "1") || strings.EqualFold(c.Query("download"), "true") {
		c.Header("Content-Disposition", `attachment; filename="`+SanitizeFilename(file.Filename)+`"`)
	}
	http.ServeContent(c.Writer, c.Request, file.Filename, file.CreatedAt, obj)
}
