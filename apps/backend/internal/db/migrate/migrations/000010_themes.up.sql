-- Custom themes created in the admin. Built-in themes are defined in code
-- (internal/modules/themes/presets.go); the active one is the `theme.active` setting.
CREATE TABLE IF NOT EXISTS themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    surface TEXT NOT NULL DEFAULT 'slate' CHECK (surface IN ('slate', 'navy', 'warm', 'graphite')),
    logo_from TEXT NOT NULL,
    logo_to TEXT NOT NULL,
    backdrop TEXT NOT NULL,
    light JSONB NOT NULL,
    dark JSONB NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_themes_slug_active
ON themes (slug) WHERE deleted_at IS NULL;
