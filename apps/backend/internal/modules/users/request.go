package users

type CreateRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Name     string `json:"name" binding:"required,min=2,max=120"`
	Password string `json:"password" binding:"required,min=10"`
	Role     string `json:"role" binding:"required,oneof=admin editor"`
}

type UpdateRequest struct {
	Name     string  `json:"name" binding:"required,min=2,max=120"`
	Role     string  `json:"role" binding:"required,oneof=admin editor"`
	IsActive *bool   `json:"isActive"`
	Password *string `json:"password" binding:"omitempty,min=10"`
}
