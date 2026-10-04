package revalidate

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"portfolio-backend/internal/config"
)

// Client asks the Next.js frontend to revalidate ISR cache tags after content changes.
// It is best-effort: failures are logged and never surface to the admin request.
type Client struct {
	url        string
	secret     string
	httpClient *http.Client
}

func New() *Client {
	return &Client{
		url:        strings.TrimSpace(config.GetEnvOrDefault("FRONTEND_REVALIDATE_URL", "")),
		secret:     strings.TrimSpace(config.GetEnvOrDefault("REVALIDATE_SECRET", "")),
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

func (c *Client) Enabled() bool {
	return c != nil && c.url != "" && c.secret != ""
}

type payload struct {
	Tags  []string `json:"tags,omitempty"`
	Paths []string `json:"paths,omitempty"`
}

// Tags revalidates cache tags synchronously.
func (c *Client) Tags(ctx context.Context, tags ...string) error {
	return c.send(ctx, payload{Tags: tags})
}

// Paths revalidates concrete paths synchronously.
func (c *Client) Paths(ctx context.Context, paths ...string) error {
	return c.send(ctx, payload{Paths: paths})
}

// Async fires a tag revalidation in the background.
func (c *Client) Async(tags ...string) {
	if !c.Enabled() || len(tags) == 0 {
		return
	}
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := c.Tags(ctx, tags...); err != nil {
			log.Printf("revalidate: %v", err)
		}
	}()
}

func (c *Client) send(ctx context.Context, p payload) error {
	if !c.Enabled() {
		return nil
	}
	body, err := json.Marshal(p)
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.url, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Revalidate-Secret", c.secret)
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("revalidate request: %w", err)
	}
	defer resp.Body.Close()
	// Drain a bounded amount so the keep-alive connection can be reused.
	_, _ = io.Copy(io.Discard, io.LimitReader(resp.Body, 4096))
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("revalidate request failed (%d)", resp.StatusCode)
	}
	return nil
}
