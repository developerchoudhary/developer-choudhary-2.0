package files

type UploadRequest struct {
	Visibility string `form:"visibility" binding:"omitempty,oneof=public private"`
	Folder     string `form:"folder" binding:"omitempty,max=64"`
	AltText    string `form:"altText" binding:"omitempty,max=300"`
}

type UpdateRequest struct {
	AltText string `json:"altText" binding:"max=300"`
	Folder  string `json:"folder" binding:"omitempty,max=64"`
}
