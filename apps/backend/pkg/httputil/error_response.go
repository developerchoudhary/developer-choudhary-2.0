package httputil

import (
	"errors"
	"fmt"
	"net/http"

	"portfolio-backend/pkg/authz"
	"portfolio-backend/pkg/dberrors"
	"portfolio-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

type AppError struct {
	StatusCode int
	Message    string
}

func (e *AppError) Error() string {
	return e.Message
}

func BadRequest(msg string) *AppError {
	return &AppError{
		StatusCode: http.StatusBadRequest,
		Message:    msg,
	}
}

func NotFound(msg string) *AppError {
	return &AppError{
		StatusCode: http.StatusNotFound,
		Message:    msg,
	}
}

func Forbidden(msg string) *AppError {
	return &AppError{
		StatusCode: http.StatusForbidden,
		Message:    msg,
	}
}

func Unauthorized(msg string) *AppError {
	return &AppError{
		StatusCode: http.StatusUnauthorized,
		Message:    msg,
	}
}

func Conflict(msg string) *AppError {
	return &AppError{
		StatusCode: http.StatusConflict,
		Message:    msg,
	}
}

func Unavailable(msg string) *AppError {
	return &AppError{
		StatusCode: http.StatusServiceUnavailable,
		Message:    msg,
	}
}

// ////////////////////////////////////////////////////////////
// ////////// Write Error Response ////////////////////////////
// ////////////////////////////////////////////////////////////
func WriteError(c *gin.Context, err error) {
	if err == nil {
		return
	}

	// print error in server logs
	fmt.Println("Error:", err.Error())

	if errors.Is(err, authz.ErrAccessDenied) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// database errors
	if dbResult := dberrors.Parse(err); dbResult != nil {
		c.JSON(dbResult.StatusCode, gin.H{
			"success": false,
			"message": dbResult.Message,
			"error":   err.Error(),
		})
		return
	}

	// application errors
	var appErr *AppError
	if errors.As(err, &appErr) {
		c.JSON(appErr.StatusCode, gin.H{
			"success": false,
			"message": appErr.Message,
		})
		return
	}

	// unknown/internal errors
	c.JSON(http.StatusInternalServerError, gin.H{
		"success": false,
		"message": "Internal server error",
	})
}

func WriteBadRequest(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, gin.H{
		"success": false,
		"message": "Bad request",
		"error":   err.Error(),
	})
}

func WriteValidationError(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, gin.H{
		"success": false,
		"message": "Validation error",
		"error":   utils.FormatValidationErrors(err),
	})
}

// ////////////////////////////////////////////////////////////
// ////////// Write Success Response //////////////////////////
// ////////////////////////////////////////////////////////////
func WriteSuccess(c *gin.Context, status int, message string, data any) {
	c.JSON(status, gin.H{
		"success": true,
		"message": message,
		"data":    data,
	})
}

func WritePaginated(c *gin.Context, message string, data any, meta any) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": message,
		"data":    data,
		"meta":    meta,
	})
}
