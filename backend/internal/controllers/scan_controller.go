package controllers

import (
	"PenPath/backend"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
)

type ScanController struct {
	APIKey string
	Model  string
}

func NewScanController(apiKey, model string) *ScanController {
	return &ScanController{APIKey: apiKey, Model: model}
}

type scanRequest struct {
	Image string `json:"image"`
}

type anthropicRequest struct {
	Model     string             `json:"model"`
	MaxTokens int                `json:"max_tokens"`
	Messages  []anthropicMessage `json:"messages"`
}

type anthropicMessage struct {
	Role    string             `json:"role"`
	Content []anthropicContent `json:"content"`
}

type anthropicContent struct {
	Type   string           `json:"type"`
	Text   string           `json:"text,omitempty"`
	Source *anthropicSource `json:"source,omitempty"`
}

type anthropicSource struct {
	Type      string `json:"type"`
	MediaType string `json:"media_type"`
	Data      string `json:"data"`
}

type anthropicResponse struct {
	Content []struct {
		Type string `json:"type"`
		Text string `json:"text"`
	} `json:"content"`
}

func (s *ScanController) TranscribeCursive(c fiber.Ctx) error {
	var body scanRequest
	if err := c.Bind().Body(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "invalid request body",
		})
	}

	if body.Image == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "image is required",
		})
	}

	// Strip data URL prefix (data:image/jpeg;base64,...) to get raw base64 + media type
	imageData := body.Image
	mediaType := "image/jpeg"
	if idx := strings.Index(imageData, ";base64,"); idx != -1 {
		prefix := imageData[:idx]
		imageData = imageData[idx+8:]
		if strings.HasPrefix(prefix, "data:") {
			mediaType = prefix[5:]
		}
	}

	reqBody := anthropicRequest{
		Model:     s.Model,
		MaxTokens: 1024,
		Messages: []anthropicMessage{
			{
				Role: "user",
				Content: []anthropicContent{
					{
						Type: "image",
						Source: &anthropicSource{
							Type:      "base64",
							MediaType: mediaType,
							Data:      imageData,
						},
					},
					{
						Type: "text",
						Text: "This image contains cursive handwriting. Transcribe exactly what is written. Output only the transcribed text with no additional commentary.",
					},
				},
			},
		},
	}

	reqBytes, err := json.Marshal(reqBody)
	if err != nil {
		backend.PrintError(fmt.Sprintf("[Scan] Failed to marshal request: %v", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "failed to process request",
		})
	}

	req, err := http.NewRequest("POST", "https://api.anthropic.com/v1/messages", bytes.NewReader(reqBytes))
	if err != nil {
		backend.PrintError(fmt.Sprintf("[Scan] Failed to create HTTP request: %v", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "failed to create request",
		})
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", s.APIKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		backend.PrintError(fmt.Sprintf("[Scan] Anthropic API call failed: %v", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "failed to contact AI service",
		})
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		backend.PrintError(fmt.Sprintf("[Scan] Failed to read response body: %v", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "failed to read AI response",
		})
	}

	if resp.StatusCode != http.StatusOK {
		backend.PrintError(fmt.Sprintf("[Scan] Anthropic API error %d: %s", resp.StatusCode, string(respBytes)))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "AI service returned an error",
		})
	}

	var anthropicResp anthropicResponse
	if err := json.Unmarshal(respBytes, &anthropicResp); err != nil {
		backend.PrintError(fmt.Sprintf("[Scan] Failed to parse Anthropic response: %v", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "failed to parse AI response",
		})
	}

	var transcription string
	for _, content := range anthropicResp.Content {
		if content.Type == "text" {
			transcription = content.Text
			break
		}
	}

	return c.JSON(fiber.Map{
		"status": "ok",
		"data": fiber.Map{
			"transcription": transcription,
		},
	})
}
