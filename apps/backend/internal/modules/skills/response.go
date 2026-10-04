package skills

import "time"

type ResponseDTO struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Category    string `json:"category"`
	IsFeatured  bool   `json:"isFeatured"`
	IsPublished bool   `json:"isPublished"`
	SortOrder   int    `json:"sortOrder"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}

type GroupDTO struct {
	Category string         `json:"category"`
	Skills   []*ResponseDTO `json:"skills"`
}

func ToResponse(s *Skill) *ResponseDTO {
	if s == nil {
		return nil
	}
	return &ResponseDTO{
		ID:          s.ID.String(),
		Name:        s.Name,
		Category:    s.Category,
		IsFeatured:  s.IsFeatured,
		IsPublished: s.IsPublished,
		SortOrder:   s.SortOrder,
		CreatedAt:   s.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt:   s.UpdatedAt.UTC().Format(time.RFC3339),
	}
}

func ToListResponse(items []*Skill) []*ResponseDTO {
	out := make([]*ResponseDTO, 0, len(items))
	for _, it := range items {
		out = append(out, ToResponse(it))
	}
	return out
}

// ToGroups buckets skills by category preserving the canonical category order.
func ToGroups(items []*Skill) []GroupDTO {
	byCat := map[string][]*ResponseDTO{}
	for _, it := range items {
		byCat[it.Category] = append(byCat[it.Category], ToResponse(it))
	}
	out := make([]GroupDTO, 0, len(Categories))
	for _, cat := range Categories {
		if list, ok := byCat[cat]; ok && len(list) > 0 {
			out = append(out, GroupDTO{Category: cat, Skills: list})
		}
	}
	return out
}
