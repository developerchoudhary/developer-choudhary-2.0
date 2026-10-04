package posts

import "portfolio-backend/pkg/pagination"

var ListSchema = pagination.Schema{
	SortColumns: map[string]string{
		"createdAt":   "posts.created_at",
		"updatedAt":   "posts.updated_at",
		"publishedAt": "posts.published_at",
		"title":       "posts.title",
		"viewCount":   "posts.view_count",
	},
	DefaultSort: "posts.published_at",
	Filters: map[string]pagination.FilterDef{
		"status":     {Column: "posts.status", Type: pagination.TypeEnum, Multi: true},
		"categoryId": {Column: "posts.category_id", Type: pagination.TypeUUID},
		"isFeatured": {Column: "posts.is_featured", Type: pagination.TypeBool},
	},
	SearchCols: []string{"posts.title", "posts.excerpt", "posts.content_text"},
}
