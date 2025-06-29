package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"
	"github.com/codechart/license-api/routes/api"
	"github.com/codechart/license-api/services/v1/audit"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	fmt.Println("🚀 Starting license-api server...")
	fmt.Printf("⏰ Timestamp: %s\n", time.Now().Format(time.RFC3339))
	fmt.Printf("🌍 Environment: Railway deployment\n")
	fmt.Printf("🔧 PID: %d\n", os.Getpid())
	
	// Check environment variables
	fmt.Println("📋 Environment variables:")
	fmt.Printf("  DB_HOST: %s\n", os.Getenv("DB_HOST"))
	fmt.Printf("  DB_PORT: %s\n", os.Getenv("DB_PORT"))
	fmt.Printf("  DB_USER: %s\n", os.Getenv("DB_USER"))
	fmt.Printf("  DB_NAME: %s\n", os.Getenv("DB_NAME"))
	fmt.Printf("  PORT: %s\n", os.Getenv("PORT"))
	
	fmt.Println("🔌 Initializing PostgreSQL connection...")
	audit.Init()
	fmt.Println("✅ PostgreSQL connection successful!")
	
	fmt.Println("🌐 Creating Fiber app...")
	app := fiber.New(fiber.Config{
		DisableStartupMessage: false,
	})
	
	fmt.Println("🔧 Adding middleware...")
	app.Use(logger.New())
	app.Use(cors.New())
	
	fmt.Println("🛣️  Mounting API routes...")
	app.Mount("/api", api.Handler())
	
	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(map[string]string{
			"status": "healthy",
			"timestamp": time.Now().Format(time.RFC3339),
			"service": "license-api",
		})
	})
	
	// Setup graceful shutdown
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	
	go func() {
		<-c
		fmt.Println("🛑 Gracefully shutting down...")
		app.Shutdown()
	}()
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	
	fmt.Printf("🎯 Starting server on port %s...\n", port)
	
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("❌ Server failed to start: %v", err)
	}
	
	fmt.Println("👋 Server shutdown complete")
}
