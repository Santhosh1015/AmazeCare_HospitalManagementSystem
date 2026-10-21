package com.hms.amazecare.dto.response;

import com.hms.amazecare.enums.AppointmentStatus;
import com.hms.amazecare.enums.Specialization;
import com.hms.amazecare.enums.VisitType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record DoctorAppointmentDto(
        Long appointmentId,
        Long patientId,
        String patientFirstName,
        String patientLastName,
        String patientContact,
        LocalDate appointmentDate,
        LocalTime appointmentTime,
        VisitType visitType,
        String reason,
        AppointmentStatus status,
        LocalDateTime createdAt

) {
}
