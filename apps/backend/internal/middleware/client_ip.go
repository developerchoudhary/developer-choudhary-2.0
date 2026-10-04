package middleware

import (
	"net"
	"strings"

	"github.com/gin-gonic/gin"
)

// ClientIP resolves the originating IP behind Traefik / Cloudflare.
func ClientIP(c *gin.Context) string {
	for _, h := range []string{"CF-Connecting-IP", "X-Real-IP"} {
		if v := strings.TrimSpace(c.GetHeader(h)); v != "" {
			return v
		}
	}
	if xff := c.GetHeader("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		if first := strings.TrimSpace(parts[0]); first != "" {
			return first
		}
	}
	ip := c.ClientIP()
	if ip == "" {
		host, _, err := net.SplitHostPort(c.Request.RemoteAddr)
		if err == nil {
			return host
		}
		return c.Request.RemoteAddr
	}
	return ip
}

// CountryHint reads edge-provided country headers (Cloudflare) when present.
func CountryHint(c *gin.Context) string {
	if v := strings.TrimSpace(c.GetHeader("CF-IPCountry")); v != "" && v != "XX" {
		return v
	}
	return ""
}
