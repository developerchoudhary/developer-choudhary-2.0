package main

import (
	"context"
	"log"
	"time"

	"portfolio-backend/internal/config"
	"portfolio-backend/internal/db/postgres"
	"portfolio-backend/internal/db/seed"
)

func main() {
	config.LoadEnv()

	db, err := postgres.InitDB()
	if err != nil {
		log.Fatalf("failed to initialize database: %v", err)
	}
	defer db.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	if err := seed.Run(ctx, db); err != nil {
		log.Fatalf("seed failed: %v", err)
	}
	log.Println("seed completed")
}
