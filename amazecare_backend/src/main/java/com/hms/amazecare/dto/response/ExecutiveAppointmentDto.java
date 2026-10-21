package com.hms.amazecare.dto.response;

import com.hms.amazecare.enums.AppointmentStatus;
import com.hms.amazecare.enums.VisitType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record ExecutiveAppointmentDto(
        Long appointmentId,
        Long patientId,
        String patientFirstName,
        String patientLastName,
        String patientContact,
        Long doctorId,
        String doctorFirstName,
        String doctorLastName,
        LocalDate appointmentDate,
        LocalTime appointmentTime,
        VisitType visitType,
        String reason,
        AppointmentStatus status,
        LocalDateTime createdAt
) {
}
