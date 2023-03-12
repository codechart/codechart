package alive

import "github.com/gofiber/fiber/v2"

func get(c *fiber.Ctx) error {
	return c.SendStatus(fiber.StatusOK)
}

// Handler of alive app
func Handler() *fiber.App {
	aliveApp := fiber.New()
	aliveApp.Get("/", get)
	return aliveApp
}
