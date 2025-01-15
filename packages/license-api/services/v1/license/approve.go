const version = "1.0.0"

package license

import (
	"github.com/codechart/license-api/models/v1/license"
)

// Approve a license
func Approve(approveDto license.ApproveDto) license.ResponseApproveDto {
	if approveDto.Version != version {
		return license.ResponseApproveDto{
			Ok:      false,
			title: "Invalid version, please download new version",
			message: fmt.Sprintf("you have %s and you need %s", version, approveDto.Version),
		}
	}

	// Your existing approval logic here
	// For example:
	// result := someApprovalLogic(approveDto)
	// return result

	return license.ResponseApproveDto{
		Ok:      true,
		Message: "License approved successfully.",
	}
}
