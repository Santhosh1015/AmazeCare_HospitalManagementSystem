package com.hms.amazecare.dto.response;

import com.hms.amazecare.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record PatientResDto(
    Long patientId,
    String firstName,
    String lastName,
    String phone,
    String address,
    LocalDate dateOfBirth,
    Gender gender
){
}
