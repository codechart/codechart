package license

import (
	"fmt"

	"github.com/codechart/license-api/models/v1/license"
)

// Approve a license
func Approve(approveDto license.ApproveDto) license.ResponseApproveDto {
	version := "1.0.0"
	if approveDto.Version != version {
		return license.ResponseApproveDto{
			Ok:      false,
			Title:   "Invalid version, please download new version",
			Message: fmt.Sprintf("you have %s and you need %s", approveDto.Version, version),
		}
	}

	return license.ResponseApproveDto{
		Ok:      true,
		Message: "License approved successfully.",
	}
}
