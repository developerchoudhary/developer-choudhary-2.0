CREATE TABLE IF NOT EXISTS post_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_post_categories_slug_active
ON post_categories (slug) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS post_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_post_tags_slug_active
ON post_tags (slug) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    content JSONB NOT NULL DEFAULT '[]'::jsonb,
    content_text TEXT NOT NULL DEFAULT '',
    cover_file_id TEXT REFERENCES files(id),
    cover_url TEXT NOT NULL DEFAULT '',
    cover_alt TEXT NOT NULL DEFAULT '',
    category_id UUID REFERENCES post_categories(id),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    reading_time_minutes INT NOT NULL DEFAULT 1,
    view_count BIGINT NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    seo_title TEXT NOT NULL DEFAULT '',
    seo_description TEXT NOT NULL DEFAULT '',
    canonical_url TEXT NOT NULL DEFAULT '',
    author_id UUID REFERENCES users(id),
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug_active
ON posts (slug) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_posts_status_published
ON posts (status, published_at DESC)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_posts_scheduled
ON posts (scheduled_for)
WHERE deleted_at IS NULL AND status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_posts_category
ON posts (category_id, published_at DESC)
WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS post_tag_links (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES post_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_post_tag_links_tag ON post_tag_links (tag_id);
