package middleware

import (
	"bytes"
	"io"
	"net/http"
	"strings"

	"portfolio-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

// TrimJSONStrings trims all JSON string values in the request body before handlers bind it.
func TrimJSONStrings() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Body == nil || c.Request.ContentLength == 0 {
			c.Next()
			return
		}
		method := c.Request.Method
		if method != http.MethodPost && method != http.MethodPut && method != http.MethodPatch {
			c.Next()
			return
		}
		ct := c.GetHeader("Content-Type")
		if ct != "" && !strings.Contains(ct, "application/json") && !strings.Contains(ct, "+json") {
			c.Next()
			return
		}

		raw, err := io.ReadAll(io.LimitReader(c.Request.Body, 4<<20))
		_ = c.Request.Body.Close()
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Unable to read request body",
			})
			return
		}

		trimmed, err := utils.TrimJSONStringValues(raw)
		if err != nil {
			trimmed = raw
		}
		c.Request.Body = io.NopCloser(bytes.NewReader(trimmed))
		c.Request.ContentLength = int64(len(trimmed))
		c.Next()
	}
}
