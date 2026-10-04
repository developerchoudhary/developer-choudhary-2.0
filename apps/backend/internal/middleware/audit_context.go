package middleware

import (
	"portfolio-backend/internal/audit"

	"github.com/gin-gonic/gin"
)

// AuditContextMiddleware injects user_id and client IP into the request context
// so audit logs can attribute actions to the correct user. Must run after AuthMiddleware.
func AuditContextMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		if userID := c.GetString("user_id"); userID != "" {
			ctx = audit.WithUserID(ctx, userID)
		}

		ip := ClientIP(c)
		ctx = audit.WithIPAddress(ctx, ip)

		c.Request = c.Request.WithContext(ctx)
		c.Next()
	}
}
