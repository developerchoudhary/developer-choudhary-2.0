package utils

import (
	"encoding/json"
	"strings"
)

// TrimJSONStringValues trims whitespace from every string value in a JSON document.
func TrimJSONStringValues(raw []byte) ([]byte, error) {
	var doc any
	if err := json.Unmarshal(raw, &doc); err != nil {
		return nil, err
	}
	return json.Marshal(trimValue(doc))
}

func trimValue(v any) any {
	switch t := v.(type) {
	case string:
		return strings.TrimSpace(t)
	case []any:
		for i := range t {
			t[i] = trimValue(t[i])
		}
		return t
	case map[string]any:
		for k, val := range t {
			t[k] = trimValue(val)
		}
		return t
	default:
		return v
	}
}
