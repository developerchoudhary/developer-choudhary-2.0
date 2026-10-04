package profile

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/uptrace/bun"
)

type Repository interface {
	Get(ctx context.Context) (*Profile, error)
	Upsert(ctx context.Context, p *Profile) (*Profile, error)
}

type repo struct {
	db *bun.DB
}

func NewRepository(db *bun.DB) Repository {
	return &repo{db: db}
}

func (r *repo) Get(ctx context.Context) (*Profile, error) {
	p := new(Profile)
	err := r.db.NewSelect().Model(p).Where("?TableAlias.id = ?", SingletonID).Scan(ctx)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return p, nil
}

func (r *repo) Upsert(ctx context.Context, p *Profile) (*Profile, error) {
	p.ID = SingletonID
	p.UpdatedAt = time.Now().UTC()
	if len(p.Socials) == 0 {
		p.Socials = []byte("[]")
	}
	_, err := r.db.NewInsert().Model(p).
		On("CONFLICT (id) DO UPDATE").
		Set("full_name = EXCLUDED.full_name").
		Set("headline = EXCLUDED.headline").
		Set("bio_short = EXCLUDED.bio_short").
		Set("bio_long = EXCLUDED.bio_long").
		Set("email = EXCLUDED.email").
		Set("phone = EXCLUDED.phone").
		Set("whatsapp = EXCLUDED.whatsapp").
		Set("location_city = EXCLUDED.location_city").
		Set("location_region = EXCLUDED.location_region").
		Set("location_country = EXCLUDED.location_country").
		Set("timezone = EXCLUDED.timezone").
		Set("avatar_file_id = EXCLUDED.avatar_file_id").
		Set("avatar_url = EXCLUDED.avatar_url").
		Set("availability_status = EXCLUDED.availability_status").
		Set("availability_note = EXCLUDED.availability_note").
		Set("years_experience = EXCLUDED.years_experience").
		Set("projects_completed = EXCLUDED.projects_completed").
		Set("clients_served = EXCLUDED.clients_served").
		Set("socials = EXCLUDED.socials").
		Set("resume_summary = EXCLUDED.resume_summary").
		Set("updated_by = EXCLUDED.updated_by").
		Set("updated_at = EXCLUDED.updated_at").
		Exec(ctx)
	if err != nil {
		return nil, err
	}
	return r.Get(ctx)
}
