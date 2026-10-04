package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"portfolio-backend/internal/config"
	"portfolio-backend/internal/db/postgres"
	"portfolio-backend/internal/mail"
	"portfolio-backend/internal/modules/notifications"
)

func main() {
	config.LoadEnv()

	db, err := postgres.InitDB()
	if err != nil {
		log.Fatalf("failed to initialize database: %v", err)
	}
	defer db.Close()

	stop := notifications.NewDispatcher(db, mail.New()).Start(15 * time.Second)
	log.Println("worker started: email outbox dispatcher")

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	stop()
	log.Println("worker stopped")
}
