package license

import "github.com/codechart/license-api/models/v1/license"

// Approve a license
func Approve(approveDto license.ApproveDto) license.ResponseApproveDto {
	return license.ResponseApproveDto{Ok: true}
}
