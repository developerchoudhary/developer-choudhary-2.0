package utils

import (
	"strings"

	"github.com/go-playground/validator/v10"
)

func toJSONFieldName(field string) string {
	if field == "" {
		return field
	}
	return strings.ToLower(field[:1]) + field[1:]
}

func FormatValidationErrors(err error) string {
	if errs, ok := err.(validator.ValidationErrors); ok {
		for _, e := range errs {
			field := toJSONFieldName(e.Field())

			switch e.Tag() {
			case "required":
				return field + " is required"
			case "min":
				return field + " must be at least " + e.Param() + " characters"
			case "max":
				return field + " must be at most " + e.Param() + " characters"
			case "len":
				return field + " must be exactly " + e.Param() + " characters"
			case "oneof":
				return field + " must be one of [" + e.Param() + "]"
			case "numeric":
				return field + " must be a number"
			case "email":
				return field + " must be a valid email address"
			case "url":
				return field + " must be a valid URL"
			case "gte":
				return field + " must be greater than or equal to " + e.Param()
			case "lte":
				return field + " must be less than or equal to " + e.Param()
			case "uuid":
				return field + " must be a valid UUID"
			default:
				return "Invalid value for " + field
			}
		}
	}

	return err.Error()
}
