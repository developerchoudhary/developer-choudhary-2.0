DROP INDEX IF EXISTS idx_projects_status;
ALTER TABLE projects DROP COLUMN IF EXISTS status;
