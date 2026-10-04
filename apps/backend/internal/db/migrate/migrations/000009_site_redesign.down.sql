-- Restores the columns and the taglines table removed by 000009. Dropped values are not restored.

ALTER TABLE resumes
    ADD COLUMN IF NOT EXISTS snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    ALTER COLUMN accent_color SET DEFAULT '#0E7C66';

ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES users(id);

ALTER TABLE leads
    ADD COLUMN IF NOT EXISTS website TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS project_type TEXT NOT NULL DEFAULT '';

ALTER TABLE reviews
    ADD COLUMN IF NOT EXISTS author_website TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);

ALTER TABLE certifications
    ADD COLUMN IF NOT EXISTS expires_at DATE,
    ADD COLUMN IF NOT EXISTS credential_id TEXT NOT NULL DEFAULT '';

ALTER TABLE experiences
    ADD COLUMN IF NOT EXISTS logo_file_id TEXT REFERENCES files(id),
    ADD COLUMN IF NOT EXISTS logo_url TEXT NOT NULL DEFAULT '';

ALTER TABLE skills
    ADD COLUMN IF NOT EXISTS proficiency INT NOT NULL DEFAULT 70 CHECK (proficiency BETWEEN 0 AND 100),
    ADD COLUMN IF NOT EXISTS years NUMERIC(4,1) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS icon TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';

ALTER TABLE settings
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS taglines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    context TEXT NOT NULL DEFAULT 'hero' CHECK (context IN ('hero', 'cta', 'footer', 'about')),
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_taglines_context_active
ON taglines (context, sort_order)
WHERE deleted_at IS NULL AND is_active = TRUE;
