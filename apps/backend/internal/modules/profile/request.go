package profile

type UpdateRequest struct {
	FullName           string       `json:"fullName" binding:"required,min=2,max=120"`
	Headline           string       `json:"headline" binding:"max=60"`
	BioShort           string       `json:"bioShort" binding:"max=600"`
	BioLong            string       `json:"bioLong" binding:"max=6000"`
	Email              string       `json:"email" binding:"omitempty,email"`
	Phone              string       `json:"phone" binding:"max=40"`
	Whatsapp           string       `json:"whatsapp" binding:"max=40"`
	LocationCity       string       `json:"locationCity" binding:"max=100"`
	LocationRegion     string       `json:"locationRegion" binding:"max=100"`
	LocationCountry    string       `json:"locationCountry" binding:"max=100"`
	Timezone           string       `json:"timezone" binding:"max=64"`
	AvatarFileID       *string      `json:"avatarFileId"`
	AvatarURL          string       `json:"avatarUrl" binding:"max=500"`
	AvailabilityStatus string       `json:"availabilityStatus" binding:"required,oneof=available limited unavailable"`
	AvailabilityNote   string       `json:"availabilityNote" binding:"max=200"`
	YearsExperience    int          `json:"yearsExperience" binding:"gte=0,lte=60"`
	ProjectsCompleted  int          `json:"projectsCompleted" binding:"gte=0"`
	ClientsServed      int          `json:"clientsServed" binding:"gte=0"`
	Socials            []SocialLink `json:"socials" binding:"dive"`
	ResumeSummary      string       `json:"resumeSummary" binding:"max=2000"`
}
