package com.hms.amazecare.dto.request;

import com.hms.amazecare.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record PatientUpdateDto(

        @NotBlank(message = "First name is required")
        String firstName,

        @NotBlank(message = "Last name is required")
        String lastName,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must contain 10 to 15 digits")
        String phone,

        @Size(max = 500, message = "Address must not exceed 255 characters")
        String address,

        @NotNull(message = "Date of birth is required")
        LocalDate dateOfBirth
) {
}
