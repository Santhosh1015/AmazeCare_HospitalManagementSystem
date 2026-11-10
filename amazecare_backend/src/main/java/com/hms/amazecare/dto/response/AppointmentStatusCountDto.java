package com.hms.amazecare.dto.response;

import com.hms.amazecare.enums.AppointmentStatus;

public record AppointmentStatusCountDto(
        AppointmentStatus status,
        Long count
) {
}
