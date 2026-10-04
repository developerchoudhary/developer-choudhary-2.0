package reviews

import "github.com/google/uuid"

// SubmitRequest is the public form payload. Website is a honeypot: bots fill it, humans never see it.
type SubmitRequest struct {
	AuthorName    string     `json:"authorName" binding:"required,min=2,max=100"`
	AuthorRole    string     `json:"authorRole" binding:"max=100"`
	AuthorCompany string     `json:"authorCompany" binding:"max=120"`
	AuthorEmail   string     `json:"authorEmail" binding:"omitempty,email,max=200"`
	Rating        int        `json:"rating" binding:"required,gte=1,lte=5"`
	Title         string     `json:"title" binding:"max=140"`
	Body          string     `json:"body" binding:"required,min=20,max=2000"`
	ProjectID     *uuid.UUID `json:"projectId"`
	ServiceSlug   string     `json:"serviceSlug" binding:"max=96"`
	Website       string     `json:"website" binding:"max=300"`
}

// AdminRequest lets the admin add imported reviews (Google, LinkedIn, WhatsApp) or edit existing ones.
type AdminRequest struct {
	AuthorName         string     `json:"authorName" binding:"required,min=2,max=100"`
	AuthorRole         string     `json:"authorRole" binding:"max=100"`
	AuthorCompany      string     `json:"authorCompany" binding:"max=120"`
	AuthorEmail        string     `json:"authorEmail" binding:"omitempty,email,max=200"`
	AuthorWebsite      string     `json:"authorWebsite" binding:"omitempty,url,max=300"`
	AuthorAvatarFileID *string    `json:"authorAvatarFileId"`
	AuthorAvatarURL    string     `json:"authorAvatarUrl" binding:"max=500"`
	Rating             int        `json:"rating" binding:"required,gte=1,lte=5"`
	Title              string     `json:"title" binding:"max=140"`
	Body               string     `json:"body" binding:"required,min=5,max=2000"`
	ProjectID          *uuid.UUID `json:"projectId"`
	ServiceSlug        string     `json:"serviceSlug" binding:"max=96"`
	Source             string     `json:"source" binding:"required,oneof=website google linkedin upwork whatsapp manual"`
	Status             string     `json:"status" binding:"required,oneof=pending approved rejected"`
	IsFeatured         *bool      `json:"isFeatured"`
	ReviewedAt         *string    `json:"reviewedAt"`
}

type StatusRequest struct {
	Status     string `json:"status" binding:"required,oneof=pending approved rejected"`
	IsFeatured *bool  `json:"isFeatured"`
}
