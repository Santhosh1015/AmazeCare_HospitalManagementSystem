package com.hms.amazecare.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.hms.amazecare.enums.VisitType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record RescheduleDto(

        @NotNull(message = "Date is required")
        LocalDate appointmentDate,

        @JsonFormat(pattern = "HH:mm")
        LocalTime appointmentTime,

        VisitType visitType,

        String reason
) {
}
