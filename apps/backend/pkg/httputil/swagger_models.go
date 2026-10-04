package httputil

// APIResponse is the standard success envelope for Swagger documentation.
// Actual API returns: { "success": true, "message": "...", "data": <T> }.
type APIResponse struct {
	Success bool   `json:"success" example:"true"`
	Message string `json:"message" example:"Operation successful"`
	Data    any    `json:"data"`
}

// PaginatedAPIResponse is the standard success envelope for paginated list endpoints.
// Actual API returns: { "success": true, "message": "...", "data": [], "meta": {} }.
type PaginatedAPIResponse struct {
	Success    bool   `json:"success" example:"true"`
	Message    string `json:"message" example:"List fetched successfully"`
	Data       any    `json:"data"`
	Pagination any    `json:"meta"`
}

// ErrorResponse is the standard error envelope for Swagger documentation.
type ErrorResponse struct {
	Success bool   `json:"success" example:"false"`
	Message string `json:"message" example:"Error description"`
}
