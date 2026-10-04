package dberrors

import (
	"errors"
	"strings"

	"github.com/uptrace/bun/driver/pgdriver"
)

const (
	CodeUniqueViolation     = "23505"
	CodeForeignKeyViolation = "23503"
	CodeNotNullViolation    = "23502"
	CodeCheckViolation      = "23514"
	CodeExclusionViolation  = "23P01"
)

type Result struct {
	Message    string
	StatusCode int
}

func Parse(err error) *Result {
	if err == nil {
		return nil
	}

	var pgErr *pgdriver.Error
	if errors.As(err, &pgErr) && pgErr != nil {
		return mapSQLStateToResult(pgErr.Field('C'))
	}

	return parseErrorString(err.Error())
}

func parseErrorString(errStr string) *Result {
	if strings.Contains(errStr, "23505") || strings.Contains(errStr, "unique constraint") || strings.Contains(errStr, "duplicate key") {
		return &Result{Message: "A record with this value already exists", StatusCode: 409}
	}
	if strings.Contains(errStr, "23503") || strings.Contains(errStr, "foreign key") {
		return &Result{Message: "Referenced record does not exist", StatusCode: 400}
	}
	if strings.Contains(errStr, "23502") || strings.Contains(errStr, "null value") {
		return &Result{Message: "Required field is missing", StatusCode: 400}
	}
	if strings.Contains(errStr, "23514") || strings.Contains(errStr, "check constraint") {
		return &Result{Message: "Value does not meet validation requirements", StatusCode: 400}
	}
	return nil
}

func mapSQLStateToResult(sqlState string) *Result {
	switch sqlState {
	case CodeUniqueViolation:
		return &Result{Message: "A record with this value already exists", StatusCode: 409}
	case CodeForeignKeyViolation:
		return &Result{Message: "Referenced record does not exist", StatusCode: 400}
	case CodeNotNullViolation:
		return &Result{Message: "Required field is missing", StatusCode: 400}
	case CodeCheckViolation, CodeExclusionViolation:
		return &Result{Message: "Value does not meet validation requirements", StatusCode: 400}
	default:
		return nil
	}
}
