package projects

import "portfolio-backend/pkg/pagination"

var ListSchema = pagination.Schema{
	SortColumns: map[string]string{
		"createdAt":   "projects.created_at",
		"updatedAt":   "projects.updated_at",
		"title":       "projects.title",
		"completedAt": "projects.completed_at",
		"sortOrder":   "projects.sort_order",
	},
	DefaultSort: "projects.sort_order",
	Filters: map[string]pagination.FilterDef{
		"projectType": {Column: "projects.project_type", Type: pagination.TypeEnum, Multi: true},
		"isFeatured":  {Column: "projects.is_featured", Type: pagination.TypeBool},
		"isPublished": {Column: "projects.is_published", Type: pagination.TypeBool},
	},
	SearchCols: []string{"projects.title", "projects.subtitle", "projects.summary", "projects.client_name"},
}
