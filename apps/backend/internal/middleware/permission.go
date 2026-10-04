package middleware

import (
	"net/http"

	"portfolio-backend/pkg/authz"

	"github.com/gin-gonic/gin"
)

// RequirePermission denies the request unless the JWT AuthContext includes the key.
// Must run after AuthMiddleware.
func RequirePermission(permission string) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth, ok := GetAuth(c)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Authorization required",
			})
			c.Abort()
			return
		}
		if err := authz.AssertPermission(auth, permission); err != nil {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": err.Error(),
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

// RequireAnyPermission allows the request when any listed permission is present.
// Must run after AuthMiddleware.
func RequireAnyPermission(permissions ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth, ok := GetAuth(c)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Authorization required",
			})
			c.Abort()
			return
		}
		if err := authz.AssertAnyPermission(auth, permissions...); err != nil {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": err.Error(),
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
