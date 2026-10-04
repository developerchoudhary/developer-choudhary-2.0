package main

import (
	"flag"
	"fmt"
	"log"
	"strconv"

	"portfolio-backend/internal/config"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
	config.LoadEnv()

	var direction string
	var forceVersion string
	flag.StringVar(&direction, "direction", "up", "Migration direction: up or down")
	flag.StringVar(&forceVersion, "force", "", "Force set migration version (e.g., '1' to force version 1)")
	flag.Parse()

	m, err := migrate.New("file://internal/db/migrate/migrations", config.GetEnv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("Failed to create migrate instance: %v", err)
	}
	defer m.Close()

	if forceVersion != "" {
		version, err := strconv.Atoi(forceVersion)
		if err != nil {
			log.Fatalf("Invalid version number: %v", err)
		}
		if err := m.Force(version); err != nil {
			log.Fatalf("Failed to force version: %v", err)
		}
		fmt.Printf("Forced migration version to %d\n", version)
		return
	}

	switch direction {
	case "up":
		if err := m.Up(); err != nil {
			if err == migrate.ErrNoChange {
				fmt.Println("No migrations to apply")
				return
			}
			log.Fatalf("Failed to run migrations: %v", err)
		}
		fmt.Println("Migrations applied successfully!")
	case "down":
		if err := m.Down(); err != nil {
			if err == migrate.ErrNoChange {
				fmt.Println("No migrations to rollback")
				return
			}
			log.Fatalf("Failed to rollback migrations: %v", err)
		}
		fmt.Println("Migrations rolled back successfully!")
	default:
		log.Fatalf("Invalid direction: %s. Use 'up' or 'down'", direction)
	}
}
