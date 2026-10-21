package com.hms.amazecare.dto.response;

import com.hms.amazecare.enums.ExecutiveDesignation;

public record ExecutiveResDto(
        String executiveName,
        String employeeId,
        ExecutiveDesignation designation
) {
}
