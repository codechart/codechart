package api

import (
	v1 "github.com/codechart/license-api/routes/api/v1"
	"github.com/gofiber/fiber/v2"
)

// Handler of api app
func Handler() *fiber.App {
	apiApp := fiber.New()
	apiApp.Mount("/v1", v1.Handler())
	return apiApp
}
