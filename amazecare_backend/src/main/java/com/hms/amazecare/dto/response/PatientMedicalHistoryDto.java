package com.hms.amazecare.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record PatientMedicalHistoryDto(
        Long medicalRecordId,
        Long appointmentId,
        LocalDate appointmentDate,
        String doctorName,
        String symptoms,
        String physicalExamination,
        String diagnosis,
        String treatmentPlan,
        List<LabResultsDto> labResults,
        PrescriptionResDto prescription
) {
}
