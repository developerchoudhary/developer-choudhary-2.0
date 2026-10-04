package notifications

import (
	"context"
	"log"
	"sync"
	"time"

	"portfolio-backend/internal/mail"

	"github.com/uptrace/bun"
)

const batchSize = 10

// Dispatcher drains the email outbox. It runs inside the API or as cmd/worker.
type Dispatcher struct {
	repo   Repository
	mailer *mail.Sender
}

func NewDispatcher(db *bun.DB, mailer *mail.Sender) *Dispatcher {
	return &Dispatcher{repo: NewRepository(db), mailer: mailer}
}

// Start polls on the interval and returns a stop function that waits for the loop to exit.
func (d *Dispatcher) Start(interval time.Duration) func() {
	ctx, cancel := context.WithCancel(context.Background())
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		d.tick(ctx)
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				d.tick(ctx)
			}
		}
	}()
	return func() {
		cancel()
		wg.Wait()
	}
}

func (d *Dispatcher) tick(ctx context.Context) {
	runCtx, cancel := context.WithTimeout(ctx, 2*time.Minute)
	defer cancel()
	if n, err := d.RunOnce(runCtx); err != nil {
		log.Printf("outbox: %v", err)
	} else if n > 0 {
		log.Printf("outbox: sent %d email(s)", n)
	}
}

// RunOnce sends one batch and reports how many succeeded.
func (d *Dispatcher) RunOnce(ctx context.Context) (int, error) {
	items, err := d.repo.ClaimBatch(ctx, batchSize)
	if err != nil {
		return 0, err
	}
	sent := 0
	for _, item := range items {
		if ctx.Err() != nil {
			return sent, ctx.Err()
		}
		err := d.mailer.Send(mail.Message{
			To:       item.ToEmail,
			ReplyTo:  item.ReplyTo,
			Subject:  item.Subject,
			HTMLBody: item.HTMLBody,
			TextBody: item.TextBody,
		})
		if err != nil {
			_ = d.repo.MarkFailed(ctx, item, err.Error())
			continue
		}
		if err := d.repo.MarkSent(ctx, item.ID); err != nil {
			return sent, err
		}
		sent++
	}
	return sent, nil
}
