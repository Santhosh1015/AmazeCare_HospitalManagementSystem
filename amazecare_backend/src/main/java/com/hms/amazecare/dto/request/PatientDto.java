package com.hms.amazecare.dto.request;

import com.hms.amazecare.enums.Gender;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record PatientDto(

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
        String firstName,

        @NotBlank(message = "Last name is required")
        String lastName,

        @NotNull(message = "Gender is required")
        Gender gender,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must contain 10 to 15 digits")
        String phone,

        @Size(max = 500, message = "Address must not exceed 255 characters")
        String address,

        @NotNull(message = "Date of birth is required")
        LocalDate dateOfBirth
) {
}
