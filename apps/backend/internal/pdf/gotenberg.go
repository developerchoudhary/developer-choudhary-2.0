package pdf

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"io/fs"
	"mime/multipart"
	"net/http"
	"strings"
	"time"

	"portfolio-backend/internal/config"
	htmltemplates "portfolio-backend/internal/templates"
	"portfolio-backend/pkg/httputil"
)

const maxPDFBytes = 20 << 20

var chromiumFontFiles = []string{
	"Inter-Variable.ttf",
}

type Client struct {
	baseURL    string
	httpClient *http.Client
}

func New() *Client {
	return &Client{
		baseURL: strings.TrimRight(config.GetEnv("GOTENBERG_URL"), "/"),
		httpClient: &http.Client{
			Timeout: 45 * time.Second,
		},
	}
}

// Options controls the Chromium page setup. Sizes are in inches (Gotenberg default unit).
type Options struct {
	PaperWidth   string
	PaperHeight  string
	MarginTop    string
	MarginBottom string
	MarginLeft   string
	MarginRight  string
}

// A4 is the default page setup for resumes.
func A4() Options {
	return Options{
		PaperWidth:   "8.27",
		PaperHeight:  "11.69",
		MarginTop:    "0.55",
		MarginBottom: "0.6",
		MarginLeft:   "0.55",
		MarginRight:  "0.55",
	}
}

func (o Options) formFields() map[string]string {
	return map[string]string{
		"paperWidth":        o.PaperWidth,
		"paperHeight":       o.PaperHeight,
		"marginTop":         o.MarginTop,
		"marginBottom":      o.MarginBottom,
		"marginLeft":        o.MarginLeft,
		"marginRight":       o.MarginRight,
		"printBackground":   "true",
		"preferCssPageSize": "false",
	}
}

func (c *Client) Healthy(ctx context.Context) bool {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+"/health", nil)
	if err != nil {
		return false
	}
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode >= 200 && resp.StatusCode < 300
}

func (c *Client) HTMLToPDF(ctx context.Context, html string, headerHTML, footerHTML string, opts Options) ([]byte, error) {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	if err := writeFormFile(writer, "index.html", []byte(html)); err != nil {
		return nil, err
	}
	if strings.TrimSpace(headerHTML) != "" {
		if err := writeFormFile(writer, "header.html", []byte(headerHTML)); err != nil {
			return nil, err
		}
	}
	if strings.TrimSpace(footerHTML) != "" {
		if err := writeFormFile(writer, "footer.html", []byte(footerHTML)); err != nil {
			return nil, err
		}
	}
	if err := attachFonts(writer); err != nil {
		return nil, err
	}
	for key, value := range opts.formFields() {
		if err := writer.WriteField(key, value); err != nil {
			return nil, err
		}
	}
	if err := writer.Close(); err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+"/forms/chromium/convert/html", &body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, httputil.Unavailable("PDF generator is unavailable")
	}
	defer resp.Body.Close()

	limited := io.LimitReader(resp.Body, maxPDFBytes+1)
	pdf, err := io.ReadAll(limited)
	if err != nil {
		return nil, err
	}
	if len(pdf) > maxPDFBytes {
		return nil, httputil.BadRequest("generated PDF is too large")
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, httputil.BadRequest(fmt.Sprintf("failed to generate PDF (%d)", resp.StatusCode))
	}
	if !bytes.HasPrefix(pdf, []byte("%PDF")) {
		return nil, httputil.BadRequest("PDF generator returned an invalid file")
	}
	return pdf, nil
}

func attachFonts(writer *multipart.Writer) error {
	for _, name := range chromiumFontFiles {
		raw, err := fs.ReadFile(htmltemplates.FS, "assets/fonts/"+name)
		if err != nil {
			return err
		}
		if err := writeFormFile(writer, name, raw); err != nil {
			return err
		}
	}
	return nil
}

func writeFormFile(writer *multipart.Writer, filename string, content []byte) error {
	part, err := writer.CreateFormFile(filename, filename)
	if err != nil {
		return err
	}
	_, err = part.Write(content)
	return err
}
