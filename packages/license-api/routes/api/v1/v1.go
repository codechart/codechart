package v1

import (
	"github.com/codechart/license-api/routes/api/v1/health"
	"github.com/codechart/license-api/routes/api/v1/license"
	"github.com/gofiber/fiber/v2"
)

// Handler of v1 app
func Handler() *fiber.App {
	v1App := fiber.New()
	v1App.Mount("/health", health.Handler())
	v1App.Mount("/license", license.Handler())
	return v1App
}
