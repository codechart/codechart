package audit

import (
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
}

var db *pg.DB

func Init() {
	db = pg.Connect(&pg.Options{
		Addr:     os.Getenv("DB_HOST") + ":" + os.Getenv("DB_PORT"),
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
		Database: os.Getenv("DB_NAME"),
	})

	err := createSchema(db)
	if err != nil {
		panic(err)
	}
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
	auditLog := &AuditLog{
		Id:         cuid.New(),
		Timestamp:  time.Now(),
		MacAddress: auditDto.MacAddress,
		Action:     auditDto.Action,
	}
	_, err := db.Model(auditLog).Insert()
	if err != nil {
		panic(err)
	}
}
