-- The redesigned public site reads all of its copy from settings and drops fields that no page,
-- email or resume template reads.

-- Taglines are replaced by settings: keep the first active call-to-action line as cta.text.
INSERT INTO settings (key, value, updated_at)
SELECT 'cta.text', to_jsonb(t.text), NOW()
FROM taglines t
WHERE t.context = 'cta' AND t.is_active AND t.deleted_at IS NULL
ORDER BY t.sort_order, t.created_at
LIMIT 1
ON CONFLICT (key) DO NOTHING;

DROP TABLE IF EXISTS taglines;

-- Settings are defined in code (internal/modules/settings/registry.go): labels, help text and defaults
-- live there, and every key is public.
DELETE FROM settings WHERE key IN ('site.shortName', 'analytics.gaId', 'hero.eyebrow');
ALTER TABLE settings
    DROP COLUMN IF EXISTS is_public,
    DROP COLUMN IF EXISTS description;

-- The hero shows the headline as a short role under the name; replace the old seeded sentence.
UPDATE profile
SET headline = 'Full-stack developer', updated_at = NOW()
WHERE headline = 'Full-stack engineer building websites, ERPs and CRMs for growing businesses';

ALTER TABLE skills
    DROP COLUMN IF EXISTS proficiency,
    DROP COLUMN IF EXISTS years,
    DROP COLUMN IF EXISTS icon,
    DROP COLUMN IF EXISTS color,
    DROP COLUMN IF EXISTS description;

ALTER TABLE experiences
    DROP COLUMN IF EXISTS logo_file_id,
    DROP COLUMN IF EXISTS logo_url;

ALTER TABLE certifications
    DROP COLUMN IF EXISTS expires_at,
    DROP COLUMN IF EXISTS credential_id;

ALTER TABLE reviews
    DROP COLUMN IF EXISTS author_website,
    DROP COLUMN IF EXISTS project_id;

ALTER TABLE leads
    DROP COLUMN IF EXISTS website,
    DROP COLUMN IF EXISTS project_type;

ALTER TABLE posts
    DROP COLUMN IF EXISTS author_id;

-- Written on every generation but never read; the default accent follows the site's sky blue.
ALTER TABLE resumes
    DROP COLUMN IF EXISTS snapshot,
    ALTER COLUMN accent_color SET DEFAULT '#0369A1';
