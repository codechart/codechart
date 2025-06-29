package main

import (
	"github.com/codechart/license-api/routes/api"
	"github.com/codechart/license-api/services/v1/audit"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

// Trigger redeploy after PostgreSQL is running

func main() {
	audit.Init()
	app := fiber.New()
	app.Use(logger.New())
	app.Use(cors.New())
	app.Mount("/api", api.Handler())
	app.Listen(":3000")
}
