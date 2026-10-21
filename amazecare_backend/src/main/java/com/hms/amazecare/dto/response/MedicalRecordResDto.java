package com.hms.amazecare.dto.response;

import java.time.LocalDateTime;

public record MedicalRecordResDto(
        Long medicalRecordId,
        Long appointmentId,
        String patientName,
        String DoctorName,
        String symptoms,
        String physicalExamination,
        String diagnosis,
        String treatmentPlan,
        LocalDateTime createdAt
) {
}
