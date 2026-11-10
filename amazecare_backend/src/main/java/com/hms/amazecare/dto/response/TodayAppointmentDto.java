package com.hms.amazecare.dto.response;

import com.hms.amazecare.enums.AppointmentStatus;

import java.time.LocalTime;

public record TodayAppointmentDto(
        Long appointmentId,
        String patientName,
        String doctorName,
        LocalTime appointmentTime,
        AppointmentStatus status
) {
}
