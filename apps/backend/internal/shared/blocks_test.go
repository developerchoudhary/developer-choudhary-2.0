package shared

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestValidateBlocks(t *testing.T) {
	raw := json.RawMessage(`[{"type":"heading","data":{"level":2,"text":"Why Go"}},{"type":"paragraph","data":{"text":"Fast and simple."}},{"type":"image","data":{"url":"https://x/y.png","alt":"ignored"}}]`)
	out, text, err := ValidateBlocks(raw)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !strings.Contains(text, "Why Go") || !strings.Contains(text, "Fast and simple.") || strings.Contains(text, "https://") {
		t.Fatalf("unexpected text %q", text)
	}
	var blocks []Block
	if err := json.Unmarshal(out, &blocks); err != nil || len(blocks) != 3 || blocks[0].ID != "b1" {
		t.Fatalf("normalized blocks wrong: %v %+v", err, blocks)
	}
	if _, _, err := ValidateBlocks(json.RawMessage(`[{"type":"script","data":{}}]`)); err == nil {
		t.Fatalf("unsupported type must fail")
	}
	if _, _, err := ValidateBlocks(json.RawMessage(`{"not":"array"}`)); err == nil {
		t.Fatalf("non-array must fail")
	}
	if out, _, err := ValidateBlocks(nil); err != nil || string(out) != "[]" {
		t.Fatalf("nil should normalize to []")
	}
}
