package certifications

type RequestDTO struct {
	Name          string  `json:"name" binding:"required,min=2,max=160"`
	Issuer        string  `json:"issuer" binding:"max=120"`
	IssuedAt      *string `json:"issuedAt"`
	CredentialURL string  `json:"credentialUrl" binding:"omitempty,url,max=400"`
	SortOrder     int     `json:"sortOrder"`
	IsPublished   *bool   `json:"isPublished"`
}
