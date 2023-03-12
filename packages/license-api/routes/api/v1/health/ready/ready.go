package ready

import "github.com/gofiber/fiber/v2"

func get(c *fiber.Ctx) error {
	return c.SendStatus(fiber.StatusOK)
}

// Handler of ready app
func Handler() *fiber.App {
	readyApp := fiber.New()
	readyApp.Get("/", get)
	return readyApp
}
