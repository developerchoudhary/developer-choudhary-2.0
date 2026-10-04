package leads

type LocationInput struct {
	Latitude  *float64 `json:"latitude" binding:"omitempty,gte=-90,lte=90"`
	Longitude *float64 `json:"longitude" binding:"omitempty,gte=-180,lte=180"`
	Accuracy  *float64 `json:"accuracy" binding:"omitempty,gte=0"`
	City      string   `json:"city" binding:"max=120"`
	Region    string   `json:"region" binding:"max=120"`
	Country   string   `json:"country" binding:"max=120"`
	Timezone  string   `json:"timezone" binding:"max=64"`
}

// SubmitRequest is the public contact form. Nickname is a honeypot field hidden from humans.
type SubmitRequest struct {
	FirstName       string            `json:"firstName" binding:"required,min=2,max=80"`
	LastName        string            `json:"lastName" binding:"max=80"`
	Email           string            `json:"email" binding:"omitempty,email,max=200"`
	Phone           string            `json:"phone" binding:"max=40"`
	Company         string            `json:"company" binding:"max=120"`
	Website         string            `json:"website" binding:"max=300"`
	ServiceInterest string            `json:"serviceInterest" binding:"max=120"`
	ProjectType     string            `json:"projectType" binding:"max=60"`
	BudgetRange     string            `json:"budgetRange" binding:"max=60"`
	Timeline        string            `json:"timeline" binding:"max=60"`
	Message         string            `json:"message" binding:"required,min=10,max=4000"`
	SourcePage      string            `json:"sourcePage" binding:"max=300"`
	Referrer        string            `json:"referrer" binding:"max=500"`
	UTM             map[string]string `json:"utm"`
	ConsentLocation bool              `json:"consentLocation"`
	Location        *LocationInput    `json:"location"`
	Nickname        string            `json:"nickname" binding:"max=100"`
}

type UpdateRequest struct {
	Status   string `json:"status" binding:"required,oneof=new contacted qualified proposal won lost spam"`
	Priority string `json:"priority" binding:"required,oneof=low normal high"`
}

type NoteRequest struct {
	Body string `json:"body" binding:"required,min=1,max=4000"`
}
