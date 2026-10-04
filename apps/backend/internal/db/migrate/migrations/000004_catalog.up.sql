CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    tagline TEXT NOT NULL DEFAULT '',
    summary TEXT NOT NULL DEFAULT '',
    description JSONB NOT NULL DEFAULT '[]'::jsonb,
    icon TEXT NOT NULL DEFAULT 'sparkles',
    deliverables TEXT[] NOT NULL DEFAULT '{}',
    tech_stack TEXT[] NOT NULL DEFAULT '{}',
    ideal_for TEXT[] NOT NULL DEFAULT '{}',
    starting_price_label TEXT NOT NULL DEFAULT '',
    timeline_label TEXT NOT NULL DEFAULT '',
    faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
    cover_file_id TEXT REFERENCES files(id),
    cover_url TEXT NOT NULL DEFAULT '',
    seo_title TEXT NOT NULL DEFAULT '',
    seo_description TEXT NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_services_slug_active
ON services (slug) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('frontend', 'backend', 'database', 'devops', 'cloud', 'tools', 'design', 'other')),
    proficiency INT NOT NULL DEFAULT 70 CHECK (proficiency BETWEEN 0 AND 100),
    years NUMERIC(4,1) NOT NULL DEFAULT 0,
    icon TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_skills_name_active
ON skills (lower(name)) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL DEFAULT '',
    summary TEXT NOT NULL DEFAULT '',
    description JSONB NOT NULL DEFAULT '[]'::jsonb,
    client_name TEXT NOT NULL DEFAULT '',
    client_industry TEXT NOT NULL DEFAULT '',
    project_type TEXT NOT NULL DEFAULT 'website' CHECK (project_type IN ('website', 'erp', 'crm', 'web-app', 'ecommerce', 'api', 'mobile', 'devops', 'other')),
    live_url TEXT NOT NULL DEFAULT '',
    repo_url TEXT NOT NULL DEFAULT '',
    cover_file_id TEXT REFERENCES files(id),
    cover_url TEXT NOT NULL DEFAULT '',
    gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
    technologies TEXT[] NOT NULL DEFAULT '{}',
    service_slugs TEXT[] NOT NULL DEFAULT '{}',
    highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
    role TEXT NOT NULL DEFAULT '',
    started_at DATE,
    completed_at DATE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    seo_title TEXT NOT NULL DEFAULT '',
    seo_description TEXT NOT NULL DEFAULT '',
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug_active
ON projects (slug) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_projects_published
ON projects (is_published, is_featured, sort_order, completed_at DESC)
WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company TEXT NOT NULL,
    company_url TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL,
    employment_type TEXT NOT NULL DEFAULT 'full-time' CHECK (employment_type IN ('full-time', 'part-time', 'freelance', 'contract', 'internship')),
    location TEXT NOT NULL DEFAULT '',
    is_remote BOOLEAN NOT NULL DEFAULT FALSE,
    started_at DATE NOT NULL,
    ended_at DATE,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    summary TEXT NOT NULL DEFAULT '',
    responsibilities TEXT[] NOT NULL DEFAULT '{}',
    achievements TEXT[] NOT NULL DEFAULT '{}',
    technologies TEXT[] NOT NULL DEFAULT '{}',
    logo_file_id TEXT REFERENCES files(id),
    logo_url TEXT NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    field TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    started_at DATE,
    ended_at DATE,
    grade TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    issuer TEXT NOT NULL DEFAULT '',
    issued_at DATE,
    expires_at DATE,
    credential_id TEXT NOT NULL DEFAULT '',
    credential_url TEXT NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
