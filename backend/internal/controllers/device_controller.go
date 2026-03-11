package controllers

import (
	"PenPath/backend/internal/databases"
	"PenPath/backend/internal/dto"
	"PenPath/backend/internal/validation"
	"context"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5"
)

type DeviceController struct {
	DB *databases.DBManager
}

func NewDeviceController(db *databases.DBManager) *DeviceController {
	return &DeviceController{DB: db}
}

func (d *DeviceController) PostDevice(c fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// authenticated JWT user id infor read
	rawUserID := c.Locals("user_id")
	userID, ok := rawUserID.(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "missing or invalid user context",
		})
	}

	// Bind request JSON into DTO.
	body := new(dto.DeviceData)
	if err := c.Bind().Body(body); err != nil {
		return validation.BadRequest(c, "invalid request body")
	}

	// required field validation
	if err := validation.Validate(body); err != nil {
		return validation.ValidationError(c, err)
	}

	if body.DeviceType == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "device_type is required",
		})
	}

	// what devices are allowed to use PenPath
	switch body.DeviceType {
	case "mobile", "tablet", "raspberry_pi", "desktop":
		// these are valid
	default:
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "invalid device_type",
		})
	}

	var deviceRowID string

	err := d.DB.DB.QueryRow(
		ctx,
		`SELECT id
		FROM devices
		WHERE device_identifier = $1`,
		body.DeviceID,
	).Scan(&deviceRowID)

	if err != nil {
		if err == pgx.ErrNoRows {
			err = d.DB.DB.QueryRow(
				ctx,
				`INSERT INTO devices(
					device_identifier,
					device_type,
					os_name,
					os_version,
					browser_name,
					browser_version,
					processor_info,
					supports_wifi,
					supports_offline
				)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
				RETURNING id`,
				body.DeviceID,
				body.DeviceType,
				body.OSName,
				body.OSVersion,
				body.BrowserName,
				body.BrowserVersion,
				body.ProcessorInfo,
				body.SupportsWifi,
				body.SupportsOffline,
			).Scan(&deviceRowID)

			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"status":  "error",
					"message": "failed to create device",
				})
			}
		} else {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status":  "error",
				"message": "failed to query device",
			})
		}
	}

	// db querying to link the device to the user in user_devices table
	_, err = d.DB.DB.Exec(
		ctx,
		`INSERT INTO user_devices (
			student_id,
			device_id,
			device_nickname,
			last_used
		)
		VALUES ($1,$2,$3,NOW())
		ON CONFLICT (student_id, device_id)
		DO UPDATE SET
			last_used = NOW(),
			device_nickname = EXCLUDED.device_nickname`,
		userID,
		deviceRowID,
		body.DeviceNickname,
	)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "failed to register device for user",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "ok",
		"message": "device registered successfully",
		"data": fiber.Map{
			"user_id":           userID,
			"device_identifier": body.DeviceID,
			"device_type":       body.DeviceType,
			"device_nickname":   body.DeviceNickname,
			"os_name":           body.OSName,
			"os_version":        body.OSVersion,
			"browser_name":      body.BrowserName,
			"browser_version":   body.BrowserVersion,
			"processor_info":    body.ProcessorInfo,
			"supports_wifi":     body.SupportsWifi,
			"supports_offline":  body.SupportsOffline,
		},
	})

}
