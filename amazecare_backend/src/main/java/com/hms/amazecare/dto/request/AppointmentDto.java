package com.hms.amazecare.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.hms.amazecare.enums.AppointmentStatus;
import com.hms.amazecare.enums.VisitType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentDto(

        Long doctorId,

        @NotNull(message = "Date is required")
        LocalDate appointmentDate,

        @JsonFormat(pattern = "HH:mm")
        LocalTime appointmentTime,

        @NotNull(message = "Visit type is required")
        VisitType visitType,

        @NotBlank(message = "Please provide an reason for appointment")
        String reason
        ) {
}
