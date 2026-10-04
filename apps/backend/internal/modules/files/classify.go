package files

import (
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"portfolio-backend/internal/config"
	"portfolio-backend/pkg/httputil"

	"github.com/gabriel-vasile/mimetype"
	"github.com/oklog/ulid/v2"
)

var (
	safeExt     = regexp.MustCompile(`^\.[a-z0-9]{1,10}$`)
	pathSegment = regexp.MustCompile(`^[A-Za-z0-9._-]+$`)
	folderRe    = regexp.MustCompile(`^[a-z0-9-]{1,64}$`)
)

var publicBlockedTypes = map[string]struct{}{
	"text/html":                {},
	"application/xhtml+xml":    {},
	"image/svg+xml":            {},
	"text/javascript":          {},
	"application/javascript":   {},
	"application/x-javascript": {},
}

func Classify(contentType string) string {
	switch {
	case contentType == "image/gif":
		return CategoryGifs
	case strings.HasPrefix(contentType, "image/"):
		return CategoryImages
	case strings.HasPrefix(contentType, "video/"):
		return CategoryVideos
	default:
		return CategoryDocuments
	}
}

func DetectType(header []byte) string {
	return mimetype.Detect(header).String()
}

func IsBlockedPublicType(contentType string) bool {
	mediaType := strings.ToLower(strings.TrimSpace(strings.Split(contentType, ";")[0]))
	_, blocked := publicBlockedTypes[mediaType]
	return blocked
}

func NewFileID() (string, error) {
	id, err := ulid.New(ulid.Timestamp(time.Now().UTC()), ulid.DefaultEntropy())
	if err != nil {
		return "", err
	}
	return id.String(), nil
}

func FileExtension(filename, contentType string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	if safeExt.MatchString(ext) {
		return ext
	}

	detected := mimetype.Lookup(contentType)
	if detected == nil {
		return ""
	}
	ext = strings.ToLower(detected.Extension())
	if ext != "" && !strings.HasPrefix(ext, ".") {
		ext = "." + ext
	}
	if safeExt.MatchString(ext) {
		return ext
	}
	return ""
}

func SanitizeFilename(name string) string {
	base := filepath.Base(strings.ReplaceAll(name, "\x00", ""))
	base = strings.TrimSpace(base)
	if base == "" || base == "." || base == ".." {
		return "file"
	}
	return base
}

func SanitizeFolder(folder string) string {
	folder = strings.ToLower(strings.TrimSpace(folder))
	if folder == "" || !folderRe.MatchString(folder) {
		return "general"
	}
	return folder
}

func ObjectKey(category, id, ext string, at time.Time) string {
	return "uploads/" + category + "/" + at.UTC().Format("2006/01/02") + "/" + id + ext
}

func ParseObjectKey(category, year, month, day, name string) (string, error) {
	if category != CategoryImages && category != CategoryDocuments && category != CategoryVideos && category != CategoryGifs {
		return "", httputil.NotFound("file not found")
	}
	if !pathSegment.MatchString(year) || !pathSegment.MatchString(month) || !pathSegment.MatchString(day) || !pathSegment.MatchString(name) {
		return "", httputil.NotFound("file not found")
	}
	if len(year) != 4 || len(month) != 2 || len(day) != 2 {
		return "", httputil.NotFound("file not found")
	}
	return "uploads/" + category + "/" + year + "/" + month + "/" + day + "/" + name, nil
}

// PublicFileURL builds the browser-facing URL; /uploads is routed to this API by the ingress.
func PublicFileURL(objectKey string) string {
	return config.PublicBaseURL() + "/" + strings.TrimLeft(objectKey, "/")
}
