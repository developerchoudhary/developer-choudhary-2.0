package shared

import (
	"encoding/json"
	"fmt"
	"strings"

	"portfolio-backend/pkg/httputil"
)

// Block is the portable rich-content unit shared by blog posts, services and case studies.
// The frontend renders blocks; the API only validates shape and extracts plain text.
type Block struct {
	ID   string          `json:"id"`
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}

var allowedBlockTypes = map[string]struct{}{
	"paragraph": {}, "heading": {}, "image": {}, "gallery": {}, "code": {}, "quote": {},
	"list": {}, "callout": {}, "divider": {}, "embed": {}, "table": {}, "cta": {}, "stats": {},
}

const maxBlocks = 400

// ValidateBlocks parses, validates and normalizes a blocks document.
// It returns the normalized JSON and the plain text (for search / reading time).
func ValidateBlocks(raw json.RawMessage) (json.RawMessage, string, error) {
	if len(raw) == 0 || string(raw) == "null" {
		return json.RawMessage("[]"), "", nil
	}
	var blocks []Block
	if err := json.Unmarshal(raw, &blocks); err != nil {
		return nil, "", httputil.BadRequest("content must be an array of blocks")
	}
	if len(blocks) > maxBlocks {
		return nil, "", httputil.BadRequest(fmt.Sprintf("content exceeds %d blocks", maxBlocks))
	}
	var text strings.Builder
	for i := range blocks {
		b := &blocks[i]
		b.Type = strings.ToLower(strings.TrimSpace(b.Type))
		if _, ok := allowedBlockTypes[b.Type]; !ok {
			return nil, "", httputil.BadRequest(fmt.Sprintf("unsupported block type %q", b.Type))
		}
		if strings.TrimSpace(b.ID) == "" {
			b.ID = fmt.Sprintf("b%d", i+1)
		}
		if len(b.Data) == 0 {
			b.Data = json.RawMessage("{}")
		}
		var data map[string]any
		if err := json.Unmarshal(b.Data, &data); err != nil {
			return nil, "", httputil.BadRequest(fmt.Sprintf("block %d has invalid data", i+1))
		}
		collectText(data, &text)
	}
	out, err := json.Marshal(blocks)
	if err != nil {
		return nil, "", err
	}
	return out, strings.TrimSpace(text.String()), nil
}

func collectText(v any, sb *strings.Builder) {
	switch t := v.(type) {
	case string:
		if strings.TrimSpace(t) != "" {
			sb.WriteString(t)
			sb.WriteString(" ")
		}
	case []any:
		for _, item := range t {
			collectText(item, sb)
		}
	case map[string]any:
		for key, val := range t {
			// skip URLs and identifiers; keep human text
			switch key {
			case "url", "href", "fileId", "id", "language", "provider", "style", "tone", "src", "alt":
				continue
			}
			collectText(val, sb)
		}
	}
}
