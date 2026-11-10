package com.hms.amazecare.dto.response;

import java.time.LocalDate;
import java.util.List;

public record DoctorConsultationResDto(
        Long appointmentId,
        Long medicalRecordId,
        String patientName,
        LocalDate appointmentDate,
        String symptoms,
        String physicalExamination,
        String diagnosis,
        String treatmentPlan,
        PrescriptionResDto prescription,
        List<LabResultsDto> labResults
) {
}
