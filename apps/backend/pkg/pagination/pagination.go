package pagination

import (
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type SortOrder string

const (
	SortAsc  SortOrder = "ASC"
	SortDesc SortOrder = "DESC"
)

// ////////////////////////////////////////////////////////////
// ////////////// Pagination Request DTO //////////////////////
// ////////////////////////////////////////////////////////////
type Request struct {
	Page     int       `json:"page" form:"page"`
	PageSize int       `json:"pageSize" form:"pageSize" binding:"omitempty,min=1,max=100"`
	Sort     SortOrder `json:"sort" form:"sort" binding:"omitempty,oneof=ASC DESC"`
	SortBy   string    `json:"sortBy" binding:"omitempty"`
}

// ////////////////////////////////////////////////////////////
// ////////////// Pagination Response DTO /////////////////////
// ////////////////////////////////////////////////////////////
type Response struct {
	SortBy        string    `json:"sortBy"`
	SortDirection SortOrder `json:"sortDirection"`
	CurrentPage   int       `json:"currentPage"`
	PageSize      int       `json:"pageSize"`
	TotalItems    int       `json:"totalItems"`
	TotalPages    int       `json:"totalPages"`
}

// ////////////////////////////////////////////////////////////
// ////////// Validate and Normalize Request //////////////////
// ////////////////////////////////////////////////////////////
func (r *Request) ValidateAndNormalize() {
	if r.Page < 1 {
		r.Page = 1
	}
	if r.PageSize < 1 {
		r.PageSize = 10
	}
	if r.PageSize > 100 {
		r.PageSize = 100
	}
}

// Offset returns the row offset for the current page.
func (r *Request) Offset() int {
	return (r.Page - 1) * r.PageSize
}

// Limit returns the page size.
func (r *Request) Limit() int {
	return r.PageSize
}

func (r *Request) Order() string {
	sort := strings.ToUpper(string(r.Sort))

	if sort != "ASC" && sort != "DESC" {
		sort = "DESC"
	}

	return r.SortBy + " " + sort
}

// ////////////////////////////////////////////////////////////
// ////////////// New Pagination Response /////////////////////
// ////////////////////////////////////////////////////////////
func NewResponse(req *Request, totalCount int) *Response {
	totalPages := int(totalCount) / req.PageSize
	if totalCount%req.PageSize > 0 {
		totalPages++
	}
	if totalCount == 0 {
		totalPages = 0
	}

	return &Response{
		CurrentPage:   req.Page,
		PageSize:      req.PageSize,
		TotalItems:    totalCount,
		TotalPages:    totalPages,
		SortBy:        req.SortBy,
		SortDirection: req.Sort,
	}
}

// ////////////////////////////////////////////////////////////
// ////////////// Parse From Query Params /////////////////////
// ////////////////////////////////////////////////////////////
func ParseFromQuery(page, pageSize int, sort SortOrder, sortBy string) *Request {
	req := &Request{
		Page:     page,
		PageSize: pageSize,
		Sort:     sort,
		SortBy:   sortBy,
	}
	req.ValidateAndNormalize()
	return req
}

// ParseIntQuery parses an integer query param with default.
func ParseIntQuery(c *gin.Context, key string, defaultValue int) int {
	valueStr := c.Query(key)
	if valueStr == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(valueStr)
	if err != nil || value < 1 {
		return defaultValue
	}
	return value
}

func ParseStringQuery(c *gin.Context, key, defaultValue string) string {
	value := c.Query(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func ParseSortQuery(c *gin.Context, key string, defaultValue SortOrder) SortOrder {
	value := strings.ToUpper(c.Query(key))

	switch SortOrder(value) {
	case SortAsc, SortDesc:
		return SortOrder(value)
	default:
		return defaultValue
	}
}

// ////////////////////////////////////////////////////////////
// ////////////// Parse Pagination from Context ///////////////
// ////////////////////////////////////////////////////////////
func Parse(c *gin.Context) *Request {
	page := ParseIntQuery(c, "page", 1)
	pageSize := ParseIntQuery(c, "pageSize", 10)
	sort := ParseSortQuery(c, "sort", "DESC")
	sortBy := ParseStringQuery(c, "sortBy", "created_at")
	return ParseFromQuery(page, pageSize, sort, sortBy)
}
