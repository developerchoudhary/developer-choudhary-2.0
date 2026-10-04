package middleware

import (
	"net/http"
	"strings"

	"portfolio-backend/pkg/authz"
	"portfolio-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

const ContextKeyAuth = "auth"

// AuthMiddleware validates the Bearer access token and stores the auth context.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := ExtractBearerToken(c)
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Authorization token required",
			})
			c.Abort()
			return
		}

		tokenInfo, err := utils.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid or expired token",
			})
			c.Abort()
			return
		}

		auth := &authz.AuthContext{
			UserID:      tokenInfo.UserID,
			SessionID:   tokenInfo.SessionID,
			Role:        tokenInfo.Role,
			Permissions: tokenInfo.Permissions,
		}

		c.Set("user_id", tokenInfo.UserID)
		c.Set("session_id", tokenInfo.SessionID)
		c.Set(ContextKeyAuth, auth)
		c.Request = c.Request.WithContext(authz.WithContext(c.Request.Context(), auth))

		c.Next()
	}
}

// OptionalAuth attaches the auth context when a valid token is present but never rejects.
func OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := ExtractBearerToken(c)
		if tokenString != "" {
			if tokenInfo, err := utils.ValidateToken(tokenString); err == nil {
				auth := &authz.AuthContext{
					UserID:      tokenInfo.UserID,
					SessionID:   tokenInfo.SessionID,
					Role:        tokenInfo.Role,
					Permissions: tokenInfo.Permissions,
				}
				c.Set("user_id", tokenInfo.UserID)
				c.Set(ContextKeyAuth, auth)
				c.Request = c.Request.WithContext(authz.WithContext(c.Request.Context(), auth))
			}
		}
		c.Next()
	}
}

func GetAuth(c *gin.Context) (*authz.AuthContext, bool) {
	v, ok := c.Get(ContextKeyAuth)
	if !ok {
		return nil, false
	}
	auth, ok := v.(*authz.AuthContext)
	return auth, ok && auth != nil
}

func ExtractBearerToken(c *gin.Context) string {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return ""
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return ""
	}

	return parts[1]
}
