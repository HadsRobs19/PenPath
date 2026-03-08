package dto

type StudentPinLoginRequest struct {
	StudentID        string `json:"student_id"`
	PIN              string `json:"pin"`
	DeviceIdentifier string `json:"device_identifier"`
}

type DeviceSessionRequest struct {
	SessionToken string `json:"session_token"`
}

type ParentLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
