package files

import "portfolio-backend/pkg/pagination"

var ListSchema = pagination.Schema{
	SortColumns: map[string]string{
		"createdAt": "files.created_at",
		"filename":  "files.filename",
		"size":      "files.size",
	},
	DefaultSort: "files.created_at",
	Filters: map[string]pagination.FilterDef{
		"category":   {Column: "files.category", Type: pagination.TypeEnum, Multi: true},
		"folder":     {Column: "files.folder", Type: pagination.TypeString},
		"visibility": {Column: "files.visibility", Type: pagination.TypeEnum},
	},
	SearchCols: []string{"files.filename", "files.alt_text"},
}
