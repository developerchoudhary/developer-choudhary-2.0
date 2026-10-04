package resumes

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Resume struct {
	bun.BaseModel `bun:"table:resumes,alias:resumes"`

	ID            uuid.UUID       `bun:"id,pk"`
	Version       int             `bun:"version,notnull"`
	Template      string          `bun:"template,notnull"`
	Title         string          `bun:"title,notnull"`
	Label         string          `bun:"label"`
	AccentColor   string          `bun:"accent_color"`
	Options       json.RawMessage `bun:"options,type:jsonb"`
	FileID        string          `bun:"file_id,notnull"`
	FileURL       string          `bun:"file_url,notnull"`
	FileSize      int64           `bun:"file_size"`
	IsCurrent     bool            `bun:"is_current"`
	DownloadCount int64           `bun:"download_count"`
	GeneratedBy   *uuid.UUID      `bun:"generated_by"`
	CreatedAt     time.Time       `bun:"created_at"`
}
