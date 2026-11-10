package com.hms.amazecare.dto.response;


import com.hms.amazecare.enums.AppointmentStatus;
import com.hms.amazecare.enums.Specialization;
import com.hms.amazecare.enums.VisitType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record PatientAppointmentDto(
        Long appointmentId,
        Long doctorId,
        String doctorFirstName,
        String doctorLastName,
        Specialization specialization,
        LocalDate appointmentDate,
        LocalTime appointmentTime,
        VisitType visitType,
        String reason,
        AppointmentStatus status,
        LocalDateTime createdAt
) {

}
