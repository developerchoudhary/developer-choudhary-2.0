package files

import (
	"time"

	"github.com/google/uuid"
)

type ResponseDTO struct {
	ID          string    `json:"id"`
	Filename    string    `json:"filename"`
	ContentType string    `json:"contentType"`
	Size        int64     `json:"size"`
	Visibility  string    `json:"visibility"`
	Category    string    `json:"category"`
	URL         string    `json:"url"`
	AltText     string    `json:"altText"`
	Width       *int      `json:"width"`
	Height      *int      `json:"height"`
	Folder      string    `json:"folder"`
	CreatedAt   time.Time `json:"createdAt"`
	CreatedBy   uuid.UUID `json:"createdBy"`
}

func ToResponse(file *File) *ResponseDTO {
	if file == nil {
		return nil
	}
	return &ResponseDTO{
		ID:          file.ID,
		Filename:    file.Filename,
		ContentType: file.ContentType,
		Size:        file.Size,
		Visibility:  file.Visibility,
		Category:    file.Category,
		URL:         file.URL,
		AltText:     file.AltText,
		Width:       file.Width,
		Height:      file.Height,
		Folder:      file.Folder,
		CreatedAt:   file.CreatedAt,
		CreatedBy:   file.CreatedBy,
	}
}

func ToListResponse(items []*File) []*ResponseDTO {
	out := make([]*ResponseDTO, 0, len(items))
	for _, it := range items {
		out = append(out, ToResponse(it))
	}
	return out
}
