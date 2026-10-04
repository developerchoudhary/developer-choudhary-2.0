ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('upcoming', 'in-progress', 'completed'));

CREATE INDEX IF NOT EXISTS idx_projects_status
ON projects (status, sort_order)
WHERE deleted_at IS NULL AND is_published = TRUE;
