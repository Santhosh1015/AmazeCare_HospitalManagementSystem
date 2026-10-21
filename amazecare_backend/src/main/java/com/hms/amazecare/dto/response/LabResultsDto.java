package com.hms.amazecare.dto.response;

import com.hms.amazecare.enums.LabTestStatus;
import com.hms.amazecare.enums.LabTestName;

import java.time.LocalDate;

public record LabResultsDto(
        Long labResultsId,
        LabTestName testName,
        LabTestStatus testStatus,
        String resultValue,
        LocalDate resultDate
) {

}
