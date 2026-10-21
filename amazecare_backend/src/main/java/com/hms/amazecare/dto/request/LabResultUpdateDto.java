package com.hms.amazecare.dto.request;

import com.hms.amazecare.enums.LabTestName;
import com.hms.amazecare.enums.LabTestStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record LabResultUpdateDto(
        LabTestStatus testStatus,
        String resultValue,
        LocalDate resultDate
) {
}
