package app

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/uptrace/bun"
)

const ShutdownTimeout = 10 * time.Second

type Lifecycle struct {
	db     *bun.DB
	server *http.Server
	sigCh  chan os.Signal
	onStop []func(context.Context)
}

func NewLifecycle(db *bun.DB, server *http.Server) *Lifecycle {
	return &Lifecycle{
		db:     db,
		server: server,
		sigCh:  make(chan os.Signal, 1),
	}
}

// OnStop registers a hook that runs before the HTTP server and database close.
func (l *Lifecycle) OnStop(fn func(context.Context)) {
	l.onStop = append(l.onStop, fn)
}

func (l *Lifecycle) Start() {
	go func() {
		if err := l.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP server error: %v", err)
		}
	}()
}

func (l *Lifecycle) NotifyShutdown() <-chan os.Signal {
	signal.Notify(l.sigCh, syscall.SIGINT, syscall.SIGTERM)
	return l.sigCh
}

func (l *Lifecycle) Shutdown(ctx context.Context) error {
	for _, fn := range l.onStop {
		fn(ctx)
	}
	if l.server != nil {
		if err := l.server.Shutdown(ctx); err != nil {
			return fmt.Errorf("server shutdown: %w", err)
		}
	}
	if l.db != nil {
		if err := l.db.Close(); err != nil {
			return fmt.Errorf("database close: %w", err)
		}
	}
	return nil
}

func (l *Lifecycle) Run() error {
	l.Start()

	<-l.NotifyShutdown()
	log.Println("Shutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), ShutdownTimeout)
	defer cancel()
	if err := l.Shutdown(ctx); err != nil {
		return err
	}
	log.Println("Server exited")
	return nil
}
