package com.hms.amazecare.dto.response;

import com.hms.amazecare.enums.ExecutiveDesignation;

public record ExecutiveDetailsResDto(
        String email,
        String firstName,
        String lastName,
        String employeeId,
        ExecutiveDesignation designation
) {
}
