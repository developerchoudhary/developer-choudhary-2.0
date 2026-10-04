package profile

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

// SingletonID is the fixed primary key of the single profile row.
var SingletonID = uuid.MustParse("00000000-0000-0000-0000-000000000001")

type Profile struct {
	bun.BaseModel `bun:"table:profile,alias:profile"`

	ID                 uuid.UUID       `bun:"id,pk"`
	FullName           string          `bun:"full_name,notnull"`
	Headline           string          `bun:"headline"`
	BioShort           string          `bun:"bio_short"`
	BioLong            string          `bun:"bio_long"`
	Email              string          `bun:"email"`
	Phone              string          `bun:"phone"`
	Whatsapp           string          `bun:"whatsapp"`
	LocationCity       string          `bun:"location_city"`
	LocationRegion     string          `bun:"location_region"`
	LocationCountry    string          `bun:"location_country"`
	Timezone           string          `bun:"timezone"`
	AvatarFileID       *string         `bun:"avatar_file_id"`
	AvatarURL          string          `bun:"avatar_url"`
	AvailabilityStatus string          `bun:"availability_status"`
	AvailabilityNote   string          `bun:"availability_note"`
	YearsExperience    int             `bun:"years_experience"`
	ProjectsCompleted  int             `bun:"projects_completed"`
	ClientsServed      int             `bun:"clients_served"`
	Socials            json.RawMessage `bun:"socials,type:jsonb"`
	ResumeSummary      string          `bun:"resume_summary"`
	UpdatedBy          *uuid.UUID      `bun:"updated_by"`
	UpdatedAt          time.Time       `bun:"updated_at"`
}

type SocialLink struct {
	Label string `json:"label" binding:"required,max=40"`
	URL   string `json:"url" binding:"required,url,max=300"`
	Icon  string `json:"icon" binding:"max=40"`
}
