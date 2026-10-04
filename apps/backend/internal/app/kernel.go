package app

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"portfolio-backend/internal/config"
	"portfolio-backend/internal/mail"
	"portfolio-backend/internal/modules/notifications"
	"portfolio-backend/internal/objectstore"
	"portfolio-backend/internal/pdf"
	"portfolio-backend/internal/revalidate"
	routes "portfolio-backend/internal/transport/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

// Listen wires infrastructure clients, mounts HTTP routes and runs the lifecycle.
func Listen(db *bun.DB) error {
	store, err := objectstore.New()
	if err != nil {
		return fmt.Errorf("failed to initialize object store: %w", err)
	}
	if err := store.EnsureBucket(context.Background()); err != nil {
		return fmt.Errorf("failed to ensure object store bucket: %w", err)
	}

	gin.SetMode(config.GetEnvOrDefault("GIN_MODE", "release"))
	engine := gin.Default()
	engine.MaxMultipartMemory = 8 << 20
	engine.RedirectTrailingSlash = false

	allowedOrigins := strings.Split(config.GetEnvOrDefault("ALLOWED_ORIGINS", "http://localhost:3000"), ",")
	engine.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type", "Range", "X-Request-ID", "X-Visitor-ID"},
		ExposeHeaders:    []string{"Content-Length", "Content-Range", "Accept-Ranges", "Content-Disposition", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	deps := &routes.Dependencies{
		DB:          db,
		Store:       store,
		Mailer:      mail.New(),
		PDF:         pdf.New(),
		Revalidator: revalidate.New(),
	}
	routes.Use(engine, deps)

	address := fmt.Sprintf(":%s", config.GetEnv("PORT"))
	server := &http.Server{
		Addr:              address,
		Handler:           engine,
		ReadHeaderTimeout: 10 * time.Second, // close slow-header connections instead of holding them
		ReadTimeout:       3 * time.Minute,  // large uploads
		WriteTimeout:      3 * time.Minute,  // resume generation, file streaming
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    64 << 10,
	}

	lc := NewLifecycle(db, server)

	// The email outbox dispatcher runs inside the API by default so a single
	// Deployment is enough; set EMAIL_DISPATCH_IN_API=false when running cmd/worker.
	if config.GetEnvBool("EMAIL_DISPATCH_IN_API", true) {
		dispatcher := notifications.NewDispatcher(db, deps.Mailer)
		stop := dispatcher.Start(20 * time.Second)
		lc.OnStop(func(ctx context.Context) { stop() })
	}

	log.Printf("Server starting on %s\n", address)
	return lc.Run()
}
