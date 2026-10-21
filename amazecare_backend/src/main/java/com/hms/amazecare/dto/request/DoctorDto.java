package com.hms.amazecare.dto.request;

import com.hms.amazecare.enums.DoctorDesignation;
import com.hms.amazecare.enums.Specialization;
import jakarta.validation.constraints.*;

public record DoctorDto(
        @NotBlank(message = "First name is required")
        String firstName,

        @NotBlank(message = "Last name is required")
        String lastName,

        @NotNull(message = "specialization is required")
        Specialization specialization,

        @NotBlank(message = "qualification is required")
        String qualification,

        @NotNull(message = "designation is required")
        DoctorDesignation designation,

        @NotBlank(message = "licenseNumber is required")
        String licenseNumber,

        @NotNull(message = "experience is required")
        @Positive
        Integer experienceYears,

        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email address")
        String email,

        @NotBlank(message = "Password is required")
        @Pattern(
                regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
                message = "Password must contain at least one letter, one digit, and 8 characters"
        )
        String password
) {
}
