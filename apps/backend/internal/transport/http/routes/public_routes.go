package routes

import (
	md "portfolio-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterPublic mounts read endpoints consumed by the Next.js site and rate-limited write endpoints:
// forms (leads, reviews) and tracking (page and post views) have separate per-IP limits.
func RegisterPublic(rg *gin.RouterGroup, h *Handlers, forms, tracking *md.RateLimiter) {
	rg.Use(cacheControl("public, max-age=60, stale-while-revalidate=300"))

	rg.GET("/site", h.Site.Bundle)
	rg.GET("/sitemap", h.Site.Sitemap)

	rg.GET("/services", h.Services.PublicList)
	rg.GET("/services/:slug", h.Services.PublicGet)
	rg.GET("/experience", h.Experience.PublicList)
	rg.GET("/education", h.Education.PublicList)
	rg.GET("/certifications", h.Certifications.PublicList)

	rg.GET("/projects", h.Projects.PublicList)
	rg.GET("/projects/featured", h.Projects.PublicFeatured)
	rg.GET("/projects/facets", h.Projects.PublicFacets)
	rg.GET("/projects/:slug", h.Projects.PublicGet)

	rg.GET("/posts", h.Posts.PublicList)
	rg.GET("/posts/:slug", h.Posts.PublicGet)
	rg.GET("/post-categories", h.Posts.ListCategories)
	rg.GET("/post-categories/:slug", h.Posts.GetCategory)
	rg.GET("/post-tags/:slug", h.Posts.GetTag)

	rg.GET("/reviews", h.Reviews.PublicList)

	rg.GET("/resume/download", h.Resumes.PublicDownload)

	write := rg.Group("")
	write.Use(forms.Middleware(), md.TrimJSONStrings(), cacheControl("no-store"))
	write.POST("/leads", h.Leads.Submit)
	write.POST("/reviews", h.Reviews.Submit)

	track := rg.Group("")
	track.Use(tracking.Middleware(), md.TrimJSONStrings(), cacheControl("no-store"))
	track.POST("/visits", h.Visits.Track)
	track.POST("/posts/:slug/view", h.Posts.PublicView)
}

func cacheControl(value string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Cache-Control", value)
		c.Next()
	}
}
