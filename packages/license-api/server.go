package main

import (
	"github.com/codechart/license-api/routes/api"
	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()
	app.Mount("/api", api.Handler())
	app.Listen(":3000")
}
