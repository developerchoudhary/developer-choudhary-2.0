package leads

import "portfolio-backend/pkg/pagination"

var ListSchema = pagination.Schema{
	SortColumns: map[string]string{
		"createdAt": "leads.created_at",
		"updatedAt": "leads.updated_at",
		"firstName": "leads.first_name",
		"status":    "leads.status",
		"priority":  "leads.priority",
	},
	DefaultSort: "leads.created_at",
	Filters: map[string]pagination.FilterDef{
		"status":          {Column: "leads.status", Type: pagination.TypeEnum, Multi: true},
		"priority":        {Column: "leads.priority", Type: pagination.TypeEnum, Multi: true},
		"serviceInterest": {Column: "leads.service_interest", Type: pagination.TypeString},
		"country":         {Column: "leads.country", Type: pagination.TypeString},
		"createdAt":       {Column: "leads.created_at", Type: pagination.TypeDate, Range: true},
	},
	SearchCols: []string{"leads.first_name", "leads.last_name", "leads.email", "leads.phone", "leads.company", "leads.message"},
}
