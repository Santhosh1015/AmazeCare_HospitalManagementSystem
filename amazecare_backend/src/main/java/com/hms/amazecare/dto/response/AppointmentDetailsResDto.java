package com.hms.amazecare.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.hms.amazecare.enums.AppointmentStatus;
import com.hms.amazecare.enums.Specialization;
import com.hms.amazecare.enums.VisitType;

import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentDetailsResDto(
        Long appointmentId,
        LocalDate appointmentDate,
        @JsonFormat(pattern = "HH:mm")
        LocalTime appointmentTime,
        VisitType visitType,
        String reason,
        AppointmentStatus status,
        Long patientId,
        String patientName,
        String patientPhone,
        Long doctorId,
        String doctorName,
        Specialization doctorSpecialization
) {
}
