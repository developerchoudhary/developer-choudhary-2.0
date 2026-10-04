package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"portfolio-backend/internal/config"
	"portfolio-backend/internal/db/postgres"
	"portfolio-backend/internal/scheduler"

	"github.com/robfig/cron/v3"
)

func main() {
	config.LoadEnv()

	db, err := postgres.InitDB()
	if err != nil {
		log.Fatalf("failed to initialize database: %v", err)
	}
	defer db.Close()

	jobs := scheduler.New(db)
	c := cron.New()
	must(c.AddFunc("@every 1m", jobs.PublishScheduledPosts))
	must(c.AddFunc("@hourly", jobs.CleanupSessions))
	must(c.AddFunc("0 3 * * *", jobs.PruneVisits))

	jobs.PublishScheduledPosts()
	c.Start()
	log.Println("scheduler started...")

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("shutting down scheduler...")
	<-c.Stop().Done()
	log.Println("scheduler stopped")
}

func must(_ cron.EntryID, err error) {
	if err != nil {
		log.Fatalf("failed to add cron job: %v", err)
	}
}
