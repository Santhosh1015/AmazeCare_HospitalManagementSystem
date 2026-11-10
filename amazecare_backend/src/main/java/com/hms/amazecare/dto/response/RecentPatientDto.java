package com.hms.amazecare.dto.response;

import java.time.LocalDate;

public record RecentPatientDto(
        Long patientId,
        String firstName,
        String lastName,
        String phone,
        LocalDate registeredOn
) {
}
