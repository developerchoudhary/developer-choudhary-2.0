package http

import (
	"net/http"

	"portfolio-backend/internal/config"
	md "portfolio-backend/internal/middleware"
	"portfolio-backend/internal/transport/http/routes"

	"github.com/gin-gonic/gin"
)

func Use(engine *gin.Engine, deps *Dependencies) {
	engine.Use(md.RequestID())

	engine.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	h := routes.Build(routes.Infra{
		DB:          deps.DB,
		Store:       deps.Store,
		PDF:         deps.PDF,
		Revalidator: deps.Revalidator,
	})

	engine.GET("/uploads/:category/:year/:month/:day/:name", h.Files.Stream)

	// Forms (leads, reviews, admin login) get a strict per-IP limit; page-view tracking a generous one,
	// so a visitor clicking through the site never loses analytics.
	forms := md.NewRateLimiter(config.GetEnvInt("PUBLIC_WRITE_RATE_PER_MINUTE", 10))
	tracking := md.NewRateLimiter(config.GetEnvInt("PUBLIC_TRACK_RATE_PER_MINUTE", 120))

	// Public forms are small (a lead or a review); admin requests carry block content and settings.
	public := engine.Group("/api/v1/public")
	public.Use(md.BodyLimit(256 << 10))
	routes.RegisterPublic(public, h, forms, tracking)

	admin := engine.Group("/api/v1/admin")
	admin.Use(md.BodyLimit(4<<20), md.TrimJSONStrings())
	routes.RegisterAdmin(admin, h, forms)
}
