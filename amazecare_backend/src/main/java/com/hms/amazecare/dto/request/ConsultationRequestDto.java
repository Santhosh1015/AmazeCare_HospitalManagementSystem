package com.hms.amazecare.dto.request;

import com.hms.amazecare.enums.LabTestName;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ConsultationRequestDto(
        @NotBlank(message = "Symptoms is required.")
        String symptoms,
        @NotBlank(message = "SPhysicalExamination data is required.")
        String physicalExamination,
        @NotBlank(message = "Diagnosis is required.")
        String diagnosis,

        String treatmentPlan,

        @Size(max = 10 )
        List<LabTestName> recommendedLabTests,


        @Valid PrescriptionReqDto prescriptionReqDto
) {
}
