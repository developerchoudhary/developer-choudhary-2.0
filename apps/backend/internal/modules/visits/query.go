package visits

import "portfolio-backend/pkg/pagination"

var ListSchema = pagination.Schema{
	SortColumns: map[string]string{
		"createdAt": "visits.created_at",
	},
	DefaultSort: "visits.created_at",
	Filters: map[string]pagination.FilterDef{
		"country":         {Column: "visits.country", Type: pagination.TypeString},
		"path":            {Column: "visits.path", Type: pagination.TypeString},
		"device":          {Column: "visits.device", Type: pagination.TypeEnum},
		"consentLocation": {Column: "visits.consent_location", Type: pagination.TypeBool},
		"visitorId":       {Column: "visits.visitor_id", Type: pagination.TypeString},
		"createdAt":       {Column: "visits.created_at", Type: pagination.TypeDate, Range: true},
	},
	SearchCols: []string{"visits.path", "visits.city", "visits.country", "visits.referrer"},
}
