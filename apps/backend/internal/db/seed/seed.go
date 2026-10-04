package seed

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"portfolio-backend/internal/audit"
	"portfolio-backend/internal/config"
	"portfolio-backend/internal/modules/education"
	"portfolio-backend/internal/modules/experience"
	"portfolio-backend/internal/modules/posts"
	"portfolio-backend/internal/modules/profile"
	"portfolio-backend/internal/modules/projects"
	"portfolio-backend/internal/modules/services"
	"portfolio-backend/internal/modules/settings"
	"portfolio-backend/internal/modules/skills"
	"portfolio-backend/internal/modules/taglines"
	"portfolio-backend/internal/modules/users"
	"portfolio-backend/internal/revalidate"
	"portfolio-backend/pkg/slug"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

// Run creates the first admin and starter content. Every step is idempotent:
// it only inserts when the table is empty, so re-running never duplicates data.
func Run(ctx context.Context, db *bun.DB) error {
	ctx = audit.WithSkipAudit(ctx)
	rv := revalidate.New()

	admin, err := ensureAdmin(ctx, db)
	if err != nil {
		return err
	}
	actor := admin.ID

	steps := []struct {
		name string
		fn   func() error
	}{
		{"profile", func() error { return seedProfile(ctx, db, rv, actor) }},
		{"settings", func() error { return seedSettings(ctx, db, rv, actor) }},
		{"taglines", func() error { return seedTaglines(ctx, db, rv, actor) }},
		{"services", func() error { return seedServices(ctx, db, rv, actor) }},
		{"skills", func() error { return seedSkills(ctx, db, rv, actor) }},
		{"experience", func() error { return seedExperience(ctx, db, rv, actor) }},
		{"education", func() error { return seedEducation(ctx, db, rv, actor) }},
		{"projects", func() error { return seedProjects(ctx, db, rv, actor) }},
		{"blog categories", func() error { return seedCategories(ctx, db, rv, actor) }},
	}
	for _, s := range steps {
		if err := s.fn(); err != nil {
			return fmt.Errorf("seed %s: %w", s.name, err)
		}
	}
	return nil
}

func ensureAdmin(ctx context.Context, db *bun.DB) (*users.User, error) {
	svc := users.NewService(users.NewRepository(db), db)
	email := config.GetEnv("ADMIN_EMAIL")
	password := config.GetEnv("ADMIN_PASSWORD")
	name := config.GetEnvOrDefault("ADMIN_NAME", "Admin")
	user, created, err := svc.EnsureAdmin(ctx, email, password, name)
	if err != nil {
		return nil, err
	}
	if created {
		log.Printf("created admin user %s", email)
	}
	if user == nil {
		repo := users.NewRepository(db)
		list, err := repo.List(ctx)
		if err != nil || len(list) == 0 {
			return nil, fmt.Errorf("no users available")
		}
		user = list[0]
	}
	return user, nil
}

func empty[T any](ctx context.Context, db *bun.DB) (bool, error) {
	n, err := db.NewSelect().Model((*T)(nil)).Count(ctx)
	return n == 0, err
}

func seedProfile(ctx context.Context, db *bun.DB, rv *revalidate.Client, actor uuid.UUID) error {
	svc := profile.NewService(profile.NewRepository(db), db, rv)
	existing, err := svc.GetModel(ctx)
	if err != nil || existing != nil {
		return err
	}
	_, err = svc.Update(ctx, &profileData, actor)
	return err
}

func seedSettings(ctx context.Context, db *bun.DB, rv *revalidate.Client, actor uuid.UUID) error {
	repo := settings.NewRepository(db)
	existing, err := repo.List(ctx, false)
	if err != nil {
		return err
	}
	have := map[string]bool{}
	for _, s := range existing {
		have[s.Key] = true
	}
	items := make([]*settings.Setting, 0)
	for _, d := range settingsData {
		if have[d.key] {
			continue
		}
		raw, err := json.Marshal(d.value)
		if err != nil {
			return err
		}
		items = append(items, &settings.Setting{Key: d.key, Value: raw, IsPublic: d.public, Description: d.description, UpdatedBy: &actor})
	}
	return repo.Upsert(ctx, items)
}

func seedTaglines(ctx context.Context, db *bun.DB, rv *revalidate.Client, actor uuid.UUID) error {
	ok, err := empty[taglines.Tagline](ctx, db)
	if err != nil || !ok {
		return err
	}
	svc := taglines.NewService(taglines.NewRepository(db), db, rv)
	for i := range taglineData {
		taglineData[i].SortOrder = i
		if _, err := svc.Create(ctx, &taglineData[i], actor); err != nil {
			return err
		}
	}
	return nil
}

func seedServices(ctx context.Context, db *bun.DB, rv *revalidate.Client, actor uuid.UUID) error {
	ok, err := empty[services.Service](ctx, db)
	if err != nil || !ok {
		return err
	}
	svc := services.NewService(services.NewRepository(db), db, rv)
	for i := range serviceData {
		serviceData[i].SortOrder = i
		if _, err := svc.Create(ctx, &serviceData[i], actor); err != nil {
			return err
		}
	}
	return nil
}

func seedSkills(ctx context.Context, db *bun.DB, rv *revalidate.Client, actor uuid.UUID) error {
	ok, err := empty[skills.Skill](ctx, db)
	if err != nil || !ok {
		return err
	}
	svc := skills.NewService(skills.NewRepository(db), db, rv)
	for i := range skillData {
		skillData[i].SortOrder = i
		if _, err := svc.Create(ctx, &skillData[i], actor); err != nil {
			return err
		}
	}
	return nil
}

func seedExperience(ctx context.Context, db *bun.DB, rv *revalidate.Client, actor uuid.UUID) error {
	ok, err := empty[experience.Experience](ctx, db)
	if err != nil || !ok {
		return err
	}
	svc := experience.NewService(experience.NewRepository(db), db, rv)
	for i := range experienceData {
		if _, err := svc.Create(ctx, &experienceData[i], actor); err != nil {
			return err
		}
	}
	return nil
}

func seedEducation(ctx context.Context, db *bun.DB, rv *revalidate.Client, actor uuid.UUID) error {
	ok, err := empty[education.Education](ctx, db)
	if err != nil || !ok {
		return err
	}
	svc := education.NewService(education.NewRepository(db), db, rv)
	for i := range educationData {
		if _, err := svc.Create(ctx, &educationData[i], actor); err != nil {
			return err
		}
	}
	return nil
}

func seedProjects(ctx context.Context, db *bun.DB, rv *revalidate.Client, actor uuid.UUID) error {
	ok, err := empty[projects.Project](ctx, db)
	if err != nil || !ok {
		return err
	}
	svc := projects.NewService(projects.NewRepository(db), db, rv)
	for i := range projectData {
		projectData[i].SortOrder = i
		projectData[i].Slug = slug.Make(projectData[i].Title)
		if _, err := svc.Create(ctx, &projectData[i], actor); err != nil {
			return err
		}
	}
	return nil
}

func seedCategories(ctx context.Context, db *bun.DB, rv *revalidate.Client, actor uuid.UUID) error {
	ok, err := empty[posts.Category](ctx, db)
	if err != nil || !ok {
		return err
	}
	svc := posts.NewService(posts.NewRepository(db), db, rv)
	for i := range categoryData {
		categoryData[i].SortOrder = i
		if _, err := svc.CreateCategory(ctx, &categoryData[i], actor); err != nil {
			return err
		}
	}
	return nil
}

func ptr[T any](v T) *T { return &v }

func date(y int, m time.Month) *string {
	s := time.Date(y, m, 1, 0, 0, 0, 0, time.UTC).Format("2006-01-02")
	return &s
}
