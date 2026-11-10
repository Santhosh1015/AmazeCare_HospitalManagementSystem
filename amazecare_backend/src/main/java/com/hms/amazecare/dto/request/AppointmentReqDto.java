package com.hms.amazecare.dto.request;

import com.hms.amazecare.enums.VisitType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AppointmentReqDto(
        @NotNull(message = "Preferred date is required")
        LocalDate appointmentDate,
        @NotNull(message = "Visit type is required")
        VisitType visitType,
        @NotBlank(message = "Reason is required")
        String reason
) {}
