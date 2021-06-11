package audit

import (
	auditModel "github.com/codechart/license-api/models/v1/audit"
	auditService "github.com/codechart/license-api/services/v1/audit"
	"github.com/gofiber/fiber/v2"
)

func post(c *fiber.Ctx) error {
	dto := new(auditModel.AuditDto)
	if err := c.BodyParser(dto); err != nil {
		return err
	}
	auditService.Create(*dto)
	return c.SendStatus(fiber.StatusOK)
}

// Handler of audit app
func Handler() *fiber.App {
	auditApp := fiber.New()
	auditApp.Post("/", post)
	return auditApp
}
