package files

import (
	"bytes"
	"context"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"strings"
	"time"

	"portfolio-backend/internal/config"
	"portfolio-backend/internal/objectstore"
	"portfolio-backend/pkg/httputil"
	"portfolio-backend/pkg/pagination"
	"portfolio-backend/pkg/utils"

	"github.com/google/uuid"
	_ "golang.org/x/image/webp"
)

type Service struct {
	repo  Repository
	store *objectstore.Store
}

func NewService(repo Repository, store *objectstore.Store) *Service {
	return &Service{repo: repo, store: store}
}

type UploadInput struct {
	UserID     uuid.UUID
	Visibility string
	Folder     string
	AltText    string
	Filename   string
	Size       int64
	Reader     io.Reader
	Sniff      []byte
}

func (s *Service) Create(ctx context.Context, in UploadInput) (*ResponseDTO, error) {
	file, err := s.CreateFile(ctx, in)
	if err != nil {
		return nil, err
	}
	return ToResponse(file), nil
}

// CreateFile stores bytes in MinIO and the metadata row; used by uploads and generated PDFs.
func (s *Service) CreateFile(ctx context.Context, in UploadInput) (*File, error) {
	maxBytes := config.MaxUploadBytes()
	if in.Size <= 0 {
		return nil, httputil.BadRequest("file is required")
	}
	if in.Size > maxBytes {
		return nil, httputil.BadRequest("file exceeds the upload limit")
	}
	visibility := in.Visibility
	if visibility == "" {
		visibility = VisibilityPublic
	}

	contentType := DetectType(in.Sniff)
	if visibility == VisibilityPublic && IsBlockedPublicType(contentType) {
		return nil, httputil.BadRequest("this file type cannot be uploaded as public")
	}

	filename := SanitizeFilename(in.Filename)
	category := Classify(contentType)
	ext := FileExtension(filename, contentType)

	id, err := NewFileID()
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	objectKey := ObjectKey(category, id, ext, now)
	fileURL := PublicFileURL(objectKey)

	// Buffer images so we can record dimensions for layout-stable <Image> tags.
	reader := in.Reader
	var width, height *int
	if category == CategoryImages || category == CategoryGifs {
		buf, err := io.ReadAll(io.LimitReader(in.Reader, maxBytes+1))
		if err != nil {
			return nil, err
		}
		if cfg, _, err := image.DecodeConfig(bytes.NewReader(buf)); err == nil {
			w, h := cfg.Width, cfg.Height
			width, height = &w, &h
		}
		reader = bytes.NewReader(buf)
		in.Size = int64(len(buf))
	}

	if err := s.store.Put(ctx, objectKey, reader, in.Size, contentType); err != nil {
		return nil, err
	}

	file := &File{
		ID:          id,
		Filename:    filename,
		ContentType: contentType,
		Size:        in.Size,
		Visibility:  visibility,
		Category:    category,
		ObjectKey:   objectKey,
		URL:         fileURL,
		AltText:     strings.TrimSpace(in.AltText),
		Width:       width,
		Height:      height,
		Folder:      SanitizeFolder(in.Folder),
		CreatedBy:   in.UserID,
		CreatedAt:   now,
	}

	model, err := s.repo.Create(ctx, file)
	if err != nil {
		_ = s.store.Remove(ctx, objectKey)
		return nil, err
	}
	return model, nil
}

func (s *Service) Get(ctx context.Context, id string) (*ResponseDTO, error) {
	file, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	return ToResponse(file), nil
}

func (s *Service) GetFile(ctx context.Context, id string) (*File, error) {
	return s.repo.Get(ctx, id)
}

func (s *Service) List(ctx context.Context, query *pagination.ListQuery) ([]*ResponseDTO, *pagination.Response, error) {
	items, total, err := s.repo.List(ctx, query)
	if err != nil {
		return nil, nil, err
	}
	return ToListResponse(items), pagination.NewResponse(&query.Request, total), nil
}

func (s *Service) Folders(ctx context.Context) ([]string, error) {
	return s.repo.Folders(ctx)
}

func (s *Service) Update(ctx context.Context, id string, req *UpdateRequest) (*ResponseDTO, error) {
	file, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	file.AltText = strings.TrimSpace(req.AltText)
	if strings.TrimSpace(req.Folder) != "" {
		file.Folder = SanitizeFolder(req.Folder)
	}
	updated, err := s.repo.Update(ctx, file)
	if err != nil {
		return nil, err
	}
	return ToResponse(updated), nil
}

// GetForStream resolves a public URL path to a file; private files need a valid bearer token.
func (s *Service) GetForStream(ctx context.Context, objectKey, bearerToken string) (*File, error) {
	file, err := s.repo.GetByObjectKey(ctx, objectKey)
	if err != nil {
		return nil, err
	}
	if file.Visibility == VisibilityPublic {
		return file, nil
	}
	if bearerToken == "" {
		return nil, httputil.Unauthorized("Authorization token required")
	}
	if _, err := utils.ValidateToken(bearerToken); err != nil {
		return nil, httputil.Unauthorized("Invalid or expired token")
	}
	return file, nil
}

func (s *Service) OpenObject(ctx context.Context, objectKey string) (io.ReadSeekCloser, error) {
	return s.store.Get(ctx, objectKey)
}

func (s *Service) Delete(ctx context.Context, id string, userID uuid.UUID) (*ResponseDTO, error) {
	file, err := s.repo.Delete(ctx, id, userID)
	if err != nil {
		return nil, err
	}
	return ToResponse(file), nil
}
