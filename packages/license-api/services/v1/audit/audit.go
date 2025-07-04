package audit

import (
	"fmt"
	"os"
	"time"

	"github.com/go-pg/pg/v10"
	"github.com/go-pg/pg/v10/orm"

	dto "github.com/codechart/license-api/models/v1/audit"
	"github.com/lucsky/cuid"
)

type AuditLog struct {
	Id         string `pg:",pk"`
	Timestamp  time.Time
	MacAddress string
	Action     string
	Details	string
}

var db *pg.DB

func Init() {
	var opts *pg.Options
	var err error
	
	fmt.Println("AUDIT: Starting PostgreSQL connection initialization...")
	
	// Try DATABASE_URL first (Railway style)
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL != "" {
		fmt.Println("AUDIT: Using DATABASE_URL for connection")
		// Sanitize URL for logging (remove password)
		sanitizedURL := databaseURL
		if len(databaseURL) > 20 {
			sanitizedURL = databaseURL[:20] + "***[REDACTED]***"
		}
		fmt.Printf("AUDIT: Connection URL: %s\n", sanitizedURL)
		
		opts, err = pg.ParseURL(databaseURL)
		if err != nil {
			fmt.Printf("AUDIT: ERROR - Failed to parse DATABASE_URL: %v\n", err)
			panic(err)
		}
		fmt.Println("AUDIT: Successfully parsed DATABASE_URL")
	} else {
		fmt.Println("AUDIT: Using individual environment variables for connection")
		// Fallback to individual environment variables
		opts = &pg.Options{
			Addr:     os.Getenv("DB_HOST") + ":" + os.Getenv("DB_PORT"),
			User:     os.Getenv("DB_USER"),
			Password: os.Getenv("DB_PASSWORD"),
			Database: os.Getenv("DB_NAME"),
		}
		fmt.Printf("AUDIT: Connection details - Host: %s, User: %s, Database: %s\n", 
			os.Getenv("DB_HOST")+":"+os.Getenv("DB_PORT"), 
			os.Getenv("DB_USER"), 
			os.Getenv("DB_NAME"))
	}
	
	fmt.Println("AUDIT: Attempting to connect to PostgreSQL...")
	db = pg.Connect(opts)
	
	// Test the connection
	var version string
	_, err = db.QueryOne(pg.Scan(&version), "SELECT version()")
	if err != nil {
		fmt.Printf("AUDIT: ERROR - Failed to connect to PostgreSQL: %v\n", err)
		panic(err)
	}
	fmt.Println("AUDIT: Successfully connected to PostgreSQL")
	fmt.Printf("AUDIT: PostgreSQL version: %s\n", version)

	fmt.Println("AUDIT: Creating database schema...")
	err = createSchema(db)
	if err != nil {
		fmt.Printf("AUDIT: ERROR - Failed to create schema: %v\n", err)
		panic(err)
	}
	fmt.Println("AUDIT: Database schema created successfully")
}

// createSchema creates database schema for AuditLog model.
func createSchema(db *pg.DB) error {
	models := []interface{}{
		(*AuditLog)(nil),
	}

	for _, model := range models {
		err := db.Model(model).CreateTable(&orm.CreateTableOptions{
			IfNotExists: true,
		})
		if err != nil {
			return err
		}
	}
	return nil
}

func Create(auditDto dto.AuditDto) {
	fmt.Printf("AUDIT: Creating audit record - Action: %s, MacAddress: %s\n", auditDto.Action, auditDto.MacAddress)
	
	auditLog := &AuditLog{
		Id:         cuid.New(),
		Timestamp:  time.Now(),
		MacAddress: auditDto.MacAddress,
		Action:     auditDto.Action,
		Details:    auditDto.Details,
	}
	
	result, err := db.Model(auditLog).Insert()
	if err != nil {
		fmt.Printf("AUDIT: ERROR - Failed to create audit record: %v\n", err)
		panic(err)
	}
	
	fmt.Printf("AUDIT: Successfully created audit record - ID: %s, Rows affected: %d\n", auditLog.Id, result.RowsAffected())
}
