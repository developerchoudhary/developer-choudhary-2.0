-- Singleton profile row (id is always the fixed UUID below, enforced by a check).
CREATE TABLE IF NOT EXISTS profile (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001',
    full_name TEXT NOT NULL,
    headline TEXT NOT NULL DEFAULT '',
    bio_short TEXT NOT NULL DEFAULT '',
    bio_long TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    whatsapp TEXT NOT NULL DEFAULT '',
    location_city TEXT NOT NULL DEFAULT '',
    location_region TEXT NOT NULL DEFAULT '',
    location_country TEXT NOT NULL DEFAULT '',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    avatar_file_id TEXT REFERENCES files(id),
    avatar_url TEXT NOT NULL DEFAULT '',
    availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'limited', 'unavailable')),
    availability_note TEXT NOT NULL DEFAULT '',
    years_experience INT NOT NULL DEFAULT 0,
    projects_completed INT NOT NULL DEFAULT 0,
    clients_served INT NOT NULL DEFAULT 0,
    socials JSONB NOT NULL DEFAULT '[]'::jsonb,
    resume_summary TEXT NOT NULL DEFAULT '',
    updated_by UUID,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT profile_singleton CHECK (id = '00000000-0000-0000-0000-000000000001')
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT NOT NULL DEFAULT '',
    updated_by UUID,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
