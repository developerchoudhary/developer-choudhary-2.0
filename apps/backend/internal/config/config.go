package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

func init() {
	LoadEnv()
}

// ////////////////////////////////////////////////////////////
// ////////////////// Load .env File //////////////////////////
// ////////////////////////////////////////////////////////////
func LoadEnv() {
	err := godotenv.Load()
	if err != nil {
		// In containerized/production environments we usually inject env vars directly
		log.Printf("warning: .env file not loaded: %v", err)
	}
}

// ////////////////////////////////////////////////////////////
// ////////////// Get Env Variable (Required) /////////////////
// ////////////////////////////////////////////////////////////
func GetEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Fatalf("Environment variable %s is not set", key)
	}

	return value
}

// ////////////////////////////////////////////////////////////
// ////////// Get Env Variable or Default /////////////////////
// ////////////////////////////////////////////////////////////
func GetEnvOrDefault(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func GetEnvInt(key string, defaultValue int) int {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return defaultValue
	}
	n, err := strconv.Atoi(raw)
	if err != nil {
		return defaultValue
	}
	return n
}

func GetEnvBool(key string, defaultValue bool) bool {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return defaultValue
	}
	b, err := strconv.ParseBool(raw)
	if err != nil {
		return defaultValue
	}
	return b
}

const defaultMaxUploadBytes int64 = 26214400 // 25MB

func MaxUploadBytes() int64 {
	raw := GetEnvOrDefault("MAX_UPLOAD_BYTES", "26214400")
	n, err := strconv.ParseInt(raw, 10, 64)
	if err != nil || n <= 0 {
		return defaultMaxUploadBytes
	}
	return n
}

// SiteURL is the public frontend origin (used in emails and canonical links).
func SiteURL() string {
	return strings.TrimRight(GetEnvOrDefault("SITE_URL", "http://localhost:3000"), "/")
}

// PublicBaseURL is the origin that serves /uploads (the API or the frontend ingress).
func PublicBaseURL() string {
	return strings.TrimRight(GetEnvOrDefault("PUBLIC_BASE_URL", "http://localhost:8080"), "/")
}
