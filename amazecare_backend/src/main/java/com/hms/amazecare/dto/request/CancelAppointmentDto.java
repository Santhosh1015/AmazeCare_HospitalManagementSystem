package com.hms.amazecare.dto.request;

import jakarta.validation.constraints.Size;

public record CancelAppointmentDto(
        @Size(max = 255)
        String cancelReason
) {
}
