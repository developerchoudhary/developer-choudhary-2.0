package posts

import (
	"net/http"

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
	httputil.WritePaginated(c, "Posts fetched successfully", items, meta)
}

func (h *Handler) PublicList(c *gin.Context) {
	query := pagination.ParseList(c, ListSchema)
	items, meta, err := h.service.PublicList(c.Request.Context(), query, c.Query("category"), c.Query("tag"))
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WritePaginated(c, "Posts fetched successfully", items, meta)
}

func (h *Handler) PublicGet(c *gin.Context) {
	item, err := h.service.PublicGetBySlug(c.Request.Context(), c.Param("slug"))
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Post fetched successfully", item)
}

func (h *Handler) PublicView(c *gin.Context) {
	if err := h.service.RecordView(c.Request.Context(), c.Param("slug")); err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "View recorded", nil)
}

func (h *Handler) Preview(c *gin.Context) {
	item, err := h.service.Preview(c.Request.Context(), c.Param("slug"))
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Post fetched successfully", item)
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
	httputil.WriteSuccess(c, http.StatusOK, "Post fetched successfully", item)
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
	httputil.WriteSuccess(c, http.StatusCreated, "Post created successfully", item)
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
	httputil.WriteSuccess(c, http.StatusOK, "Post updated successfully", item)
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
	httputil.WriteSuccess(c, http.StatusOK, "Post deleted successfully", nil)
}

// ---------------- categories ----------------

func (h *Handler) ListCategories(c *gin.Context) {
	items, err := h.service.ListCategories(c.Request.Context())
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Categories fetched successfully", items)
}

func (h *Handler) GetCategory(c *gin.Context) {
	item, err := h.service.GetCategoryBySlug(c.Request.Context(), c.Param("slug"))
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Category fetched successfully", item)
}

func (h *Handler) CreateCategory(c *gin.Context) {
	actor, err := uuid.Parse(c.GetString("user_id"))
	if err != nil {
		httputil.WriteBadRequest(c, err)
		return
	}
	req := &CategoryRequest{}
	if err := c.ShouldBindJSON(req); err != nil {
		httputil.WriteValidationError(c, err)
		return
	}
	item, err := h.service.CreateCategory(c.Request.Context(), req, actor)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusCreated, "Category created successfully", item)
}

func (h *Handler) UpdateCategory(c *gin.Context) {
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
	req := &CategoryRequest{}
	if err := c.ShouldBindJSON(req); err != nil {
		httputil.WriteValidationError(c, err)
		return
	}
	item, err := h.service.UpdateCategory(c.Request.Context(), id, req, actor)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Category updated successfully", item)
}

func (h *Handler) DeleteCategory(c *gin.Context) {
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
	if err := h.service.DeleteCategory(c.Request.Context(), id, actor); err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Category deleted successfully", nil)
}

// ---------------- tags ----------------

func (h *Handler) ListTags(c *gin.Context) {
	items, err := h.service.ListTags(c.Request.Context())
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Tags fetched successfully", items)
}

func (h *Handler) GetTag(c *gin.Context) {
	item, err := h.service.GetTagBySlug(c.Request.Context(), c.Param("slug"))
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Tag fetched successfully", item)
}

func (h *Handler) CreateTag(c *gin.Context) {
	actor, err := uuid.Parse(c.GetString("user_id"))
	if err != nil {
		httputil.WriteBadRequest(c, err)
		return
	}
	req := &TagRequest{}
	if err := c.ShouldBindJSON(req); err != nil {
		httputil.WriteValidationError(c, err)
		return
	}
	item, err := h.service.CreateTag(c.Request.Context(), req, actor)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusCreated, "Tag created successfully", item)
}

func (h *Handler) UpdateTag(c *gin.Context) {
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
	req := &TagRequest{}
	if err := c.ShouldBindJSON(req); err != nil {
		httputil.WriteValidationError(c, err)
		return
	}
	item, err := h.service.UpdateTag(c.Request.Context(), id, req, actor)
	if err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Tag updated successfully", item)
}

func (h *Handler) DeleteTag(c *gin.Context) {
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
	if err := h.service.DeleteTag(c.Request.Context(), id, actor); err != nil {
		httputil.WriteError(c, err)
		return
	}
	httputil.WriteSuccess(c, http.StatusOK, "Tag deleted successfully", nil)
}
