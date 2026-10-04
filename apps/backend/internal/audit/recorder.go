package audit

import (
	"context"
	"encoding/json"
	"log"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

func Record(ctx context.Context, db bun.IDB, action Action, entityName string, entityID uuid.UUID, payload any) error {
	if ShouldSkipAudit(ctx) {
		return nil
	}

	changesJSON, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	userID := GetUserID(ctx)
	var performedBy *string
	if userID != "" {
		performedBy = &userID
	}

	ip := GetIPAddress(ctx)
	if ip == "" {
		ip = "system"
	}

	entry := &Log{
		Action:      action,
		Changes:     changesJSON,
		EntityID:    entityID,
		EntityName:  entityName,
		IPAddress:   ip,
		PerformedBy: performedBy,
	}

	_, err = db.NewInsert().
		Model(entry).
		Column("action", "changes", "entity_id", "entity_name", "ip_address", "performed_by").
		Exec(ctx)
	return err
}

// Try records and only logs failures; audit must never break the main flow.
func Try(ctx context.Context, db bun.IDB, action Action, entityName string, entityID uuid.UUID, payload any) {
	if err := Record(ctx, db, action, entityName, entityID, payload); err != nil {
		log.Printf("audit: failed to record %s on %s/%s: %v", action, entityName, entityID, err)
	}
}

// RecordCreate logs a CREATE operation.
func RecordCreate(ctx context.Context, db bun.IDB, entityName string, entityID uuid.UUID, payload any) error {
	return Record(ctx, db, ActionCreate, entityName, entityID, payload)
}

// RecordUpdate logs an UPDATE operation.
func RecordUpdate(ctx context.Context, db bun.IDB, entityName string, entityID uuid.UUID, payload any) error {
	return Record(ctx, db, ActionUpdate, entityName, entityID, payload)
}

// RecordDelete logs a DELETE operation.
func RecordDelete(ctx context.Context, db bun.IDB, entityName string, entityID uuid.UUID, payload any) error {
	return Record(ctx, db, ActionDelete, entityName, entityID, payload)
}
