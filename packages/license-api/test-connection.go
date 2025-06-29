package main

import (
	"fmt"
	"os"
	"github.com/go-pg/pg/v10"
)

func main() {
	opts := &pg.Options{
		Addr:     os.Getenv("DB_HOST") + ":" + os.Getenv("DB_PORT"),
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
		Database: os.Getenv("DB_NAME"),
	}
	
	fmt.Printf("Connecting to PostgreSQL:\n")
	fmt.Printf("Host: %s\n", opts.Addr)
	fmt.Printf("User: %s\n", opts.User)
	fmt.Printf("Database: %s\n", opts.Database)
	
	db := pg.Connect(opts)
	defer db.Close()
	
	var version string
	_, err := db.QueryOne(pg.Scan(&version), "SELECT version()")
	if err != nil {
		fmt.Printf("ERROR: %v\n", err)
		os.Exit(1)
	}
	
	fmt.Printf("SUCCESS: Connected to PostgreSQL\n")
	fmt.Printf("Version: %s\n", version)
}