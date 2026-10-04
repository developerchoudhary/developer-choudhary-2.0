package pagination

import "testing"

func TestValidateAndNormalize(t *testing.T) {
	r := &Request{Page: 0, PageSize: 500}
	r.ValidateAndNormalize()
	if r.Page != 1 || r.PageSize != 100 {
		t.Fatalf("unexpected normalization: %+v", r)
	}
	if r.Offset() != 0 {
		t.Fatalf("offset should be 0 for page 1")
	}
}

func TestNewResponse(t *testing.T) {
	r := ParseFromQuery(2, 10, SortDesc, "created_at")
	resp := NewResponse(r, 25)
	if resp.TotalPages != 3 || resp.CurrentPage != 2 || resp.TotalItems != 25 {
		t.Fatalf("unexpected response: %+v", resp)
	}
	empty := NewResponse(r, 0)
	if empty.TotalPages != 0 {
		t.Fatalf("empty result should have 0 pages")
	}
}
