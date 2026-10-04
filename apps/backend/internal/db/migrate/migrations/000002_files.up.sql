CREATE TABLE IF NOT EXISTS files (
    id            TEXT PRIMARY KEY,
    filename      TEXT NOT NULL,
    content_type  TEXT NOT NULL,
    size          BIGINT NOT NULL,
    visibility    TEXT NOT NULL CHECK (visibility IN ('public', 'private')),
    category      TEXT NOT NULL CHECK (category IN ('images', 'documents', 'videos', 'gifs')),
    object_key    TEXT NOT NULL UNIQUE,
    url           TEXT NOT NULL,
    alt_text      TEXT NOT NULL DEFAULT '',
    width         INT,
    height        INT,
    folder        TEXT NOT NULL DEFAULT 'general',
    created_by    UUID NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_by    UUID,
    deleted_at    TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_files_object_key_active
    ON files (object_key)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_files_folder_created
    ON files (folder, created_at DESC)
    WHERE deleted_at IS NULL;
