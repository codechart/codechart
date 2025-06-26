package approve

import (
	licenseModel "github.com/codechart/license-api/models/v1/license"
	licenseService "github.com/codechart/license-api/services/v1/license"
	"github.com/gofiber/fiber/v2"
)

func post(c *fiber.Ctx) error {
	dto := new(licenseModel.ApproveDto)
	if err := c.BodyParser(dto); err != nil {
		return err
	}
	result := licenseService.Approve(*dto)
	return c.JSON(result)
}

// Handler of approve app
func Handler() *fiber.App {
	approveApp := fiber.New()
	approveApp.Post("/", post)
	return approveApp
}
