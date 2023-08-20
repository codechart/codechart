package license

import (
	"github.com/codechart/codechart/packages/license-api/routes/api/v1/license/approve"
	"github.com/gofiber/fiber/v2"
)

// Handler of license app
func Handler() *fiber.App {
	licenseApp := fiber.New()
	licenseApp.Mount("/approve", approve.Handler())
	return licenseApp
}
