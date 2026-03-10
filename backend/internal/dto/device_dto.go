package dto

type DeviceData struct {
	DeviceID        string `json:"device_identifier" validate:"required"`
	DeviceType      string `json:"device_type" validate:"required,oneof=mobile tablet raspberry_pi desktop"`
	DeviceNickname  string `json:"device_nickname"`
	OSName          string `json:"os_name"`
	OSVersion       string `json:"os_version"`
	BrowserName     string `json:"browser_name"`
	BrowserVersion  string `json:"browser_version"`
	ProcessorInfo   string `json:"processor_info"`
	SupportsWifi    bool   `json:"supports_wifi"`
	SupportsOffline bool   `json:"supports_offline"`
}
