package routes

import (
	md "portfolio-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

const (
	permContentWrite  = "content:write"
	permBlogWrite     = "blog:write"
	permMediaWrite    = "media:write"
	permReviewsWrite  = "reviews:write"
	permLeadsRead     = "leads:read"
	permLeadsWrite    = "leads:write"
	permVisitsRead    = "visits:read"
	permSettingsWrite = "settings:write"
	permUsersWrite    = "users:write"
	permResumeWrite   = "resume:write"
	permDashboardRead = "dashboard:read"
)

func RegisterAdmin(rg *gin.RouterGroup, h *Handlers, limiter *md.RateLimiter) {
	rg.Use(func(c *gin.Context) {
		c.Header("Cache-Control", "no-store")
		c.Next()
	})

	rg.POST("/auth/login", limiter.Middleware(), h.Auth.Login)
	rg.POST("/auth/refresh", h.Auth.Refresh)

	r := rg.Group("")
	r.Use(md.AuthMiddleware(), md.AuditContextMiddleware())

	r.POST("/auth/logout", h.Auth.Logout)
	r.GET("/auth/me", h.Auth.Me)
	r.PUT("/auth/password", h.Auth.ChangePassword)

	r.GET("/dashboard", md.RequirePermission(permDashboardRead), h.Dashboard.Overview)

	users := r.Group("/users", md.RequirePermission(permUsersWrite))
	users.GET("", h.Users.List)
	users.POST("", h.Users.Create)
	users.PUT("/:id", h.Users.Update)

	r.GET("/profile", h.Profile.Get)
	r.PUT("/profile", md.RequirePermission(permContentWrite), h.Profile.Update)

	r.GET("/settings", h.Settings.List)
	r.PUT("/settings", md.RequirePermission(permSettingsWrite), h.Settings.BulkUpdate)

	themes := r.Group("/themes", md.RequirePermission(permSettingsWrite))
	themes.GET("", h.Themes.List)
	themes.POST("", h.Themes.Create)
	themes.POST("/preview", h.Themes.Preview)
	themes.PUT("/active", h.Themes.Activate)
	themes.PUT("/:id", h.Themes.Update)
	themes.DELETE("/:id", h.Themes.Delete)

	content := r.Group("", md.RequirePermission(permContentWrite))
	crud(content, "/services", h.Services.List, h.Services.Create, h.Services.Get, h.Services.Update, h.Services.Delete)
	crud(content, "/skills", h.Skills.List, h.Skills.Create, nil, h.Skills.Update, h.Skills.Delete)
	crud(content, "/projects", h.Projects.List, h.Projects.Create, h.Projects.Get, h.Projects.Update, h.Projects.Delete)
	crud(content, "/experience", h.Experience.List, h.Experience.Create, h.Experience.Get, h.Experience.Update, h.Experience.Delete)
	crud(content, "/education", h.Education.List, h.Education.Create, nil, h.Education.Update, h.Education.Delete)
	crud(content, "/certifications", h.Certifications.List, h.Certifications.Create, nil, h.Certifications.Update, h.Certifications.Delete)

	blog := r.Group("", md.RequirePermission(permBlogWrite))
	blog.GET("/posts", h.Posts.List)
	blog.POST("/posts", h.Posts.Create)
	blog.GET("/posts/preview/:slug", h.Posts.Preview)
	blog.GET("/posts/:id", h.Posts.Get)
	blog.PUT("/posts/:id", h.Posts.Update)
	blog.DELETE("/posts/:id", h.Posts.Delete)
	blog.GET("/post-categories", h.Posts.ListCategories)
	blog.POST("/post-categories", h.Posts.CreateCategory)
	blog.PUT("/post-categories/:id", h.Posts.UpdateCategory)
	blog.DELETE("/post-categories/:id", h.Posts.DeleteCategory)
	blog.GET("/post-tags", h.Posts.ListTags)
	blog.POST("/post-tags", h.Posts.CreateTag)
	blog.PUT("/post-tags/:id", h.Posts.UpdateTag)
	blog.DELETE("/post-tags/:id", h.Posts.DeleteTag)

	media := r.Group("/media", md.RequirePermission(permMediaWrite))
	media.GET("", h.Files.List)
	media.POST("", h.Files.Create)
	media.GET("/folders", h.Files.Folders)
	media.PUT("/:id", h.Files.Update)
	media.DELETE("/:id", h.Files.Delete)

	reviews := r.Group("/reviews", md.RequirePermission(permReviewsWrite))
	reviews.GET("", h.Reviews.List)
	reviews.POST("", h.Reviews.Create)
	reviews.PUT("/:id", h.Reviews.Update)
	reviews.PATCH("/:id/status", h.Reviews.SetStatus)
	reviews.DELETE("/:id", h.Reviews.Delete)

	leads := r.Group("/leads", md.RequirePermission(permLeadsRead))
	leads.GET("", h.Leads.List)
	leads.GET("/stats", h.Leads.Stats)
	leads.GET("/export", h.Leads.ExportCSV)
	leads.GET("/:id", h.Leads.Get)
	leads.PUT("/:id", md.RequirePermission(permLeadsWrite), h.Leads.Update)
	leads.POST("/:id/notes", md.RequirePermission(permLeadsWrite), h.Leads.AddNote)
	leads.DELETE("/:id", md.RequirePermission(permLeadsWrite), h.Leads.Delete)

	visits := r.Group("/visits", md.RequirePermission(permVisitsRead))
	visits.GET("", h.Visits.List)
	visits.GET("/stats", h.Visits.Stats)

	resumes := r.Group("/resumes", md.RequirePermission(permResumeWrite))
	resumes.GET("", h.Resumes.List)
	resumes.GET("/templates", h.Resumes.Templates)
	resumes.POST("/preview", h.Resumes.Preview)
	resumes.POST("", h.Resumes.Generate)
	resumes.POST("/:id/current", h.Resumes.SetCurrent)
	resumes.DELETE("/:id", h.Resumes.Delete)
}

func crud(rg *gin.RouterGroup, path string, list, create, get, update, del gin.HandlerFunc) {
	rg.GET(path, list)
	rg.POST(path, create)
	if get != nil {
		rg.GET(path+"/:id", get)
	}
	rg.PUT(path+"/:id", update)
	rg.DELETE(path+"/:id", del)
}
