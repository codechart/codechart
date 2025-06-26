package health

import (
	"github.com/codechart/license-api/routes/api/v1/health/alive"
	"github.com/codechart/license-api/routes/api/v1/health/ready"
	"github.com/gofiber/fiber/v2"
)

// Handler of health app
func Handler() *fiber.App {
	healthApp := fiber.New()
	healthApp.Mount("/ready", ready.Handler())
	healthApp.Mount("/alive", alive.Handler())
	return healthApp
}
