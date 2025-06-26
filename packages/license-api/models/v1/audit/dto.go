package dto

// AuditDto is a data transfer object for a dto action audit request
type AuditDto struct {
	MacAddress string `json:"macAddress"`
	Action     string `json:"action"`
	Details	   string `json:"details"`
}
