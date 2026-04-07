package dto

// APIResponse is the standard response structure for all API endpoints.
// Now React frontend can reliably parse data regardless of the endpoint.

type APIResponse struct {
	Status  string `json:"status"`            // "ok" or "error"
	Message string `json:"message,omitempty"` // Optional message
	Data    any    `json:"data,omitempty"`    // Response payload (for success)
	Code    int    `json:"code,omitempty"`    // HTTP status code (for errors)
}

// NewSuccessResponse creates a standard success response
func NewSuccessResponse(data any) APIResponse {
	return APIResponse{
		Status: "ok",
		Data:   data,
	}
}

// NewSuccessResponseWithMessage creates a standard success response with a message
func NewSuccessResponseWithMessage(message string, data any) APIResponse {
	return APIResponse{
		Status:  "ok",
		Message: message,
		Data:    data,
	}
}

// NewErrorResponse creates a standard error response
func NewErrorResponse(code int, message string) APIResponse {
	return APIResponse{
		Status:  "error",
		Message: message,
		Code:    code,
	}
}

// LessonsResponse wraps lesson data in the standard response format
type LessonsResponse struct {
	Lessons []Lesson `json:"lessons"`
}
