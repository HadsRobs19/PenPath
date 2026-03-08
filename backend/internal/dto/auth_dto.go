package dto

type DeviceSessionRequest struct {
	SessionToken string `json:"session_token"`
}

type LoginRequest struct {
	Email            string `json:"email"`
	Password         string `json:"password"`
	DeviceIdentifier string `json:"device_identifier"`
}
