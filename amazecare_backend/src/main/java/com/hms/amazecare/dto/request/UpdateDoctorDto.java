package com.hms.amazecare.dto.request;

import com.hms.amazecare.enums.DoctorDesignation;
import com.hms.amazecare.enums.Specialization;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record UpdateDoctorDto(
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
        Integer experienceYears
) {
}
