package resumes

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"portfolio-backend/internal/audit"
	"portfolio-backend/internal/modules/certifications"
	"portfolio-backend/internal/modules/education"
	"portfolio-backend/internal/modules/experience"
	"portfolio-backend/internal/modules/files"
	"portfolio-backend/internal/modules/profile"
	"portfolio-backend/internal/modules/projects"
	"portfolio-backend/internal/modules/skills"
	"portfolio-backend/internal/pdf"
	"portfolio-backend/internal/render"
	"portfolio-backend/internal/revalidate"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

const defaultAccent = "#0E7C66"

type Deps struct {
	Profile        *profile.Service
	Experience     *experience.Service
	Education      *education.Service
	Certifications *certifications.Service
	Skills         *skills.Service
	Projects       *projects.Service
	Files          *files.Service
	PDF            *pdf.Client
	Revalidator    *revalidate.Client
}

type Service struct {
	Deps
	repo Repository
	db   *bun.DB
}

func NewService(db *bun.DB, deps Deps) *Service {
	return &Service{Deps: deps, repo: NewRepository(db), db: db}
}

func (s *Service) options(req *GenerateRequest) (render.Options, string) {
	opts := render.DefaultOptions()
	if req.Options != nil {
		opts = *req.Options
	}
	if opts.MaxProjects <= 0 || opts.MaxProjects > 8 {
		opts.MaxProjects = 4
	}
	if opts.MaxExperience <= 0 || opts.MaxExperience > 12 {
		opts.MaxExperience = 6
	}
	accent := strings.TrimSpace(req.AccentColor)
	if accent == "" {
		accent = defaultAccent
	}
	return opts, accent
}

// Preview renders the resume HTML without producing a PDF.
func (s *Service) Preview(ctx context.Context, req *GenerateRequest) (string, error) {
	opts, accent := s.options(req)
	data, err := s.build(ctx, req.Template, accent, opts)
	if err != nil {
		return "", err
	}
	return render.ResumeHTML(data)
}

// Generate builds the resume from live data, renders a PDF via Gotenberg and stores it.
func (s *Service) Generate(ctx context.Context, req *GenerateRequest, actor uuid.UUID) (*ResponseDTO, error) {
	opts, accent := s.options(req)
	data, err := s.build(ctx, req.Template, accent, opts)
	if err != nil {
		return nil, err
	}
	html, err := render.ResumeHTML(data)
	if err != nil {
		return nil, err
	}
	footer, err := render.ResumeFooterHTML(data)
	if err != nil {
		return nil, err
	}
	pdfBytes, err := s.PDF.HTMLToPDF(ctx, html, "", footer, pdf.A4())
	if err != nil {
		return nil, err
	}

	filename := fmt.Sprintf("%s-resume-%s.pdf", slugName(data.Profile.FullName), time.Now().UTC().Format("2006-01"))
	file, err := s.Files.CreateFile(ctx, files.UploadInput{
		UserID:     actor,
		Visibility: files.VisibilityPublic,
		Folder:     "resumes",
		Filename:   filename,
		Size:       int64(len(pdfBytes)),
		Reader:     bytes.NewReader(pdfBytes),
		Sniff:      pdfBytes[:min(512, len(pdfBytes))],
	})
	if err != nil {
		return nil, err
	}

	optsJSON, _ := json.Marshal(opts)
	snapshot, _ := json.Marshal(data)
	setCurrent := req.SetCurrent == nil || *req.SetCurrent
	item := &Resume{
		Template:    req.Template,
		Title:       fmt.Sprintf("%s · %s", data.Profile.FullName, firstNonEmpty(opts.TargetRole, data.Profile.Headline, "Resume")),
		Label:       strings.TrimSpace(req.Label),
		AccentColor: accent,
		Options:     optsJSON,
		Snapshot:    snapshot,
		FileID:      file.ID,
		FileURL:     file.URL,
		FileSize:    file.Size,
		GeneratedBy: &actor,
	}
	if err := s.repo.Create(ctx, item, setCurrent); err != nil {
		_, _ = s.Files.Delete(ctx, file.ID, actor)
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionCreate, "resume", item.ID, map[string]any{"version": item.Version, "template": item.Template})
	if setCurrent {
		s.Revalidator.Async("resume", "site")
	}
	return ToResponse(item), nil
}

func (s *Service) List(ctx context.Context) ([]*ResponseDTO, error) {
	items, err := s.repo.List(ctx)
	if err != nil {
		return nil, err
	}
	return ToListResponse(items), nil
}

func (s *Service) Get(ctx context.Context, id uuid.UUID) (*ResponseDTO, error) {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	return ToResponse(item), nil
}

func (s *Service) SetCurrent(ctx context.Context, id uuid.UUID) (*ResponseDTO, error) {
	if err := s.repo.SetCurrent(ctx, id); err != nil {
		return nil, err
	}
	audit.Try(ctx, s.db, audit.ActionUpdate, "resume", id, map[string]any{"isCurrent": true})
	s.Revalidator.Async("resume", "site")
	return s.Get(ctx, id)
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID, actor uuid.UUID) error {
	item, err := s.repo.Get(ctx, id)
	if err != nil {
		return err
	}
	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}
	_, _ = s.Files.Delete(ctx, item.FileID, actor)
	audit.Try(ctx, s.db, audit.ActionDelete, "resume", id, nil)
	return nil
}

func (s *Service) Current(ctx context.Context) (*PublicDTO, error) {
	item, err := s.repo.Current(ctx)
	if err != nil {
		return nil, err
	}
	return ToPublic(item), nil
}

// DownloadURL records the download and returns where to redirect.
func (s *Service) DownloadURL(ctx context.Context) (string, error) {
	item, err := s.repo.Current(ctx)
	if err != nil {
		return "", err
	}
	_ = s.repo.IncrementDownload(ctx, item.ID)
	return item.FileURL + "?download=1", nil
}

func slugName(name string) string {
	name = strings.ToLower(strings.TrimSpace(name))
	return strings.ReplaceAll(strings.Join(strings.Fields(name), "-"), "/", "-")
}
