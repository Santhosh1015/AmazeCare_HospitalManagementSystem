package com.hms.amazecare.dto.request;

import com.hms.amazecare.enums.Specialization;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DoctorDto(
        @NotBlank(message = "First name is required")
        String firstName,

        @NotBlank(message = "Last name is required")
        String lastName,

        @NotNull(message = "Specialization is required")
        Specialization specialization,

        @NotBlank(message = "Qualification is required")
        String qualification,

        String designation,

        String licenseNumber,

        @NotNull(message = "Experience is required")
        Integer experienceYears,

        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email address")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 20,message = "Password must be between 8 and 20 characters")
        String password
) {
}
