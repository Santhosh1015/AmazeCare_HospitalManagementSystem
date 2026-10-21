package com.hms.amazecare.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminDto(
        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email address")
        String email,

        @NotBlank(message = "password is required")
        @Size(min = 8, max = 20, message = "Password must be between 8 and 20 characters")
        String password

) {
}
