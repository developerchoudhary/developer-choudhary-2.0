package files

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

const (
	VisibilityPublic  = "public"
	VisibilityPrivate = "private"

	CategoryImages    = "images"
	CategoryDocuments = "documents"
	CategoryVideos    = "videos"
	CategoryGifs      = "gifs"
)

type File struct {
	bun.BaseModel `bun:"table:files,alias:files"`

	ID          string     `bun:"id,pk"`
	Filename    string     `bun:"filename"`
	ContentType string     `bun:"content_type"`
	Size        int64      `bun:"size"`
	Visibility  string     `bun:"visibility"`
	Category    string     `bun:"category"`
	ObjectKey   string     `bun:"object_key"`
	URL         string     `bun:"url"`
	AltText     string     `bun:"alt_text"`
	Width       *int       `bun:"width"`
	Height      *int       `bun:"height"`
	Folder      string     `bun:"folder"`
	CreatedBy   uuid.UUID  `bun:"created_by"`
	CreatedAt   time.Time  `bun:"created_at"`
	DeletedBy   *uuid.UUID `bun:"deleted_by"`
	DeletedAt   *time.Time `bun:"deleted_at"`
}
