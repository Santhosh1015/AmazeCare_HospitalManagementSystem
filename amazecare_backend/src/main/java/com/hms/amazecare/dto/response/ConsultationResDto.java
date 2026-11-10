package com.hms.amazecare.dto.response;

import com.hms.amazecare.enums.AppointmentStatus;

import java.time.LocalDate;
import java.util.List;

public record ConsultationResDto(
    Long appointmentId,
    AppointmentStatus appointmentStatus,
    Long medicalRecordId,
    String patientName,
    String doctorName,
    LocalDate appointmentDate,
    String diagnosis,
    List<LabTestsResDto> labTests,
    PrescriptionResDto prescriptionResDto
) {
}
