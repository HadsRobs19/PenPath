package dto

type DeviceSessionRequest struct {
	SessionToken string `json:"session_token" validate:"required"`
}

type LoginRequest struct {
	Email            string `json:"email" validate:"required,email"`
	Password         string `json:"password" validate:"required,min=6"`
	DeviceIdentifier string `json:"device_identifier" validate:"required"`
}
