package com.hms.amazecare.dto.response;

import com.hms.amazecare.enums.LabTestStatus;
import com.hms.amazecare.enums.LabTestName;

public record LabTestsResDto(
        LabTestName testType,
        LabTestStatus testStatus
) {
}
