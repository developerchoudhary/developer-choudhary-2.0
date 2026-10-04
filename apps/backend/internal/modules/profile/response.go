package profile

import (
	"encoding/json"
	"time"
)

type ResponseDTO struct {
	FullName           string       `json:"fullName"`
	Headline           string       `json:"headline"`
	BioShort           string       `json:"bioShort"`
	BioLong            string       `json:"bioLong"`
	Email              string       `json:"email"`
	Phone              string       `json:"phone"`
	Whatsapp           string       `json:"whatsapp"`
	LocationCity       string       `json:"locationCity"`
	LocationRegion     string       `json:"locationRegion"`
	LocationCountry    string       `json:"locationCountry"`
	Timezone           string       `json:"timezone"`
	AvatarFileID       *string      `json:"avatarFileId"`
	AvatarURL          string       `json:"avatarUrl"`
	AvailabilityStatus string       `json:"availabilityStatus"`
	AvailabilityNote   string       `json:"availabilityNote"`
	YearsExperience    int          `json:"yearsExperience"`
	ProjectsCompleted  int          `json:"projectsCompleted"`
	ClientsServed      int          `json:"clientsServed"`
	Socials            []SocialLink `json:"socials"`
	ResumeSummary      string       `json:"resumeSummary"`
	UpdatedAt          string       `json:"updatedAt"`
}

func ToResponse(p *Profile) *ResponseDTO {
	if p == nil {
		return nil
	}
	socials := []SocialLink{}
	if len(p.Socials) > 0 {
		_ = json.Unmarshal(p.Socials, &socials)
	}
	return &ResponseDTO{
		FullName:           p.FullName,
		Headline:           p.Headline,
		BioShort:           p.BioShort,
		BioLong:            p.BioLong,
		Email:              p.Email,
		Phone:              p.Phone,
		Whatsapp:           p.Whatsapp,
		LocationCity:       p.LocationCity,
		LocationRegion:     p.LocationRegion,
		LocationCountry:    p.LocationCountry,
		Timezone:           p.Timezone,
		AvatarFileID:       p.AvatarFileID,
		AvatarURL:          p.AvatarURL,
		AvailabilityStatus: p.AvailabilityStatus,
		AvailabilityNote:   p.AvailabilityNote,
		YearsExperience:    p.YearsExperience,
		ProjectsCompleted:  p.ProjectsCompleted,
		ClientsServed:      p.ClientsServed,
		Socials:            socials,
		ResumeSummary:      p.ResumeSummary,
		UpdatedAt:          p.UpdatedAt.UTC().Format(time.RFC3339),
	}
}
