package com.hms.amazecare.dto.request;

import com.hms.amazecare.enums.ExecutiveDesignation;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record ExecutiveUpdateDto(

        @NotBlank(message = "First name is required")
        @NotNull(message = "First name is required")
        String firstName,

        @NotBlank(message = "Last name is required")
        @NotNull(message = "Last name is required")
        String lastName,

        @NotBlank(message = "employee ID is required")
        String employeeId,

        @NotNull(message = "Designation is required")
        ExecutiveDesignation designation
) {
}
