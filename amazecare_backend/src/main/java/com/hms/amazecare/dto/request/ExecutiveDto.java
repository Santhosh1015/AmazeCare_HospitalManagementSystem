package com.hms.amazecare.dto.request;

import com.hms.amazecare.enums.ExecutiveDesignation;
import jakarta.validation.constraints.*;

public record ExecutiveDto(

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email address")
        String email,

        @NotBlank(message = "Password is required")
        @Pattern(
                regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
                message = "Password must contain at least one letter, one digit, and 8 characters"
        )
        String password,

        @NotBlank(message = "First name is required")
        @NotNull(message = "First name is required")
        String firstName,

        @NotBlank(message = "Last name is required")
        @NotNull(message = "Last name is required")
        String lastName,

        @NotBlank(message = "employee ID is required")
        String employeeId,

        @NotBlank(message = "Designation is required")
        ExecutiveDesignation designation
) {
}
