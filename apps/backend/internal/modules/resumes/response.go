package resumes

import (
	"encoding/json"
	"time"

	"portfolio-backend/internal/render"
)

type ResponseDTO struct {
	ID            string         `json:"id"`
	Version       int            `json:"version"`
	Template      string         `json:"template"`
	Title         string         `json:"title"`
	Label         string         `json:"label"`
	AccentColor   string         `json:"accentColor"`
	Options       render.Options `json:"options"`
	FileID        string         `json:"fileId"`
	FileURL       string         `json:"fileUrl"`
	DownloadURL   string         `json:"downloadUrl"`
	FileSize      int64          `json:"fileSize"`
	IsCurrent     bool           `json:"isCurrent"`
	DownloadCount int64          `json:"downloadCount"`
	CreatedAt     string         `json:"createdAt"`
}

// PublicDTO is the current resume as the site shows it; downloads go through /public/resume/download,
// which counts them.
type PublicDTO struct {
	FileURL   string `json:"fileUrl"`
	FileSize  int64  `json:"fileSize"`
	UpdatedAt string `json:"updatedAt"`
}

func ToResponse(r *Resume) *ResponseDTO {
	if r == nil {
		return nil
	}
	opts := render.DefaultOptions()
	if len(r.Options) > 0 {
		_ = json.Unmarshal(r.Options, &opts)
	}
	return &ResponseDTO{
		ID:            r.ID.String(),
		Version:       r.Version,
		Template:      r.Template,
		Title:         r.Title,
		Label:         r.Label,
		AccentColor:   r.AccentColor,
		Options:       opts,
		FileID:        r.FileID,
		FileURL:       r.FileURL,
		DownloadURL:   r.FileURL + "?download=1",
		FileSize:      r.FileSize,
		IsCurrent:     r.IsCurrent,
		DownloadCount: r.DownloadCount,
		CreatedAt:     r.CreatedAt.UTC().Format(time.RFC3339),
	}
}

func ToPublic(r *Resume) *PublicDTO {
	if r == nil {
		return nil
	}
	return &PublicDTO{
		FileURL:   r.FileURL,
		FileSize:  r.FileSize,
		UpdatedAt: r.CreatedAt.UTC().Format(time.RFC3339),
	}
}

func ToListResponse(items []*Resume) []*ResponseDTO {
	out := make([]*ResponseDTO, 0, len(items))
	for _, it := range items {
		out = append(out, ToResponse(it))
	}
	return out
}
