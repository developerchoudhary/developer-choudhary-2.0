package reviews

import "portfolio-backend/pkg/pagination"

var ListSchema = pagination.Schema{
	SortColumns: map[string]string{
		"createdAt":  "reviews.created_at",
		"rating":     "reviews.rating",
		"authorName": "reviews.author_name",
	},
	DefaultSort: "reviews.created_at",
	Filters: map[string]pagination.FilterDef{
		"status":     {Column: "reviews.status", Type: pagination.TypeEnum, Multi: true},
		"source":     {Column: "reviews.source", Type: pagination.TypeEnum, Multi: true},
		"rating":     {Column: "reviews.rating", Type: pagination.TypeNumber, Multi: true},
		"isFeatured": {Column: "reviews.is_featured", Type: pagination.TypeBool},
		"projectId":  {Column: "reviews.project_id", Type: pagination.TypeUUID},
	},
	SearchCols: []string{"reviews.author_name", "reviews.author_company", "reviews.title", "reviews.body"},
}
