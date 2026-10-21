package com.hms.amazecare.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.hms.amazecare.enums.AppointmentStatus;
import com.hms.amazecare.enums.Specialization;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingRespDto(
        Long appointmentId,
        String doctorFirstName,
        String doctorLastName,
        Specialization specialization,
        LocalDate appointmentDate,
        @JsonFormat(pattern = "HH:mm")
        LocalTime appointmentTime,
        AppointmentStatus status
) {
}
