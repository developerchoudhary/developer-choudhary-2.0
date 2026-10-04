package main

import (
	"log"

	"portfolio-backend/internal/app"
	"portfolio-backend/internal/config"
	"portfolio-backend/internal/db/postgres"
)

func main() {
	config.LoadEnv()

	db, err := postgres.InitDB()
	if err != nil {
		log.Fatalf("failed to initialize database: %v", err)
	}

	if err := app.Listen(db); err != nil {
		log.Fatalf("failed to start HTTP server: %v", err)
	}
}
