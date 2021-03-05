package license

// ApproveDto is a data transfer object for a license approval request
type ApproveDto struct {
	MacAddress string `json:"macAddress"`
}

// ResponseApproveDto is a data transfer object for a license approval response
type ResponseApproveDto struct {
	Ok     bool   `json:"ok"`
	Reason string `json:"reason"`
}
