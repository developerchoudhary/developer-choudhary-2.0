CREATE TABLE IF NOT EXISTS email_outbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    to_email TEXT NOT NULL,
    reply_to TEXT NOT NULL DEFAULT '',
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT NOT NULL DEFAULT '',
    template TEXT NOT NULL DEFAULT '',
    entity_name TEXT NOT NULL DEFAULT '',
    entity_id UUID,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    last_error TEXT NOT NULL DEFAULT '',
    next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_outbox_pending
ON email_outbox (next_attempt_at)
WHERE status IN ('pending', 'failed');

CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version INT NOT NULL,
    template TEXT NOT NULL CHECK (template IN ('modern', 'classic', 'compact')),
    title TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    accent_color TEXT NOT NULL DEFAULT '#0E7C66',
    options JSONB NOT NULL DEFAULT '{}'::jsonb,
    snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    file_id TEXT NOT NULL REFERENCES files(id),
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    download_count BIGINT NOT NULL DEFAULT 0,
    generated_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_resumes_version ON resumes (version);
CREATE UNIQUE INDEX IF NOT EXISTS idx_resumes_current ON resumes (is_current) WHERE is_current = TRUE;
