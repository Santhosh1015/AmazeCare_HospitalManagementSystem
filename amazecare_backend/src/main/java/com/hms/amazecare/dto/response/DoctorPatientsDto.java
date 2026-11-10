package com.hms.amazecare.dto.response;

import java.util.List;

public record DoctorPatientsDto(
        List<PatientResDto> patientResDtos,
        PaginationResDto paginationResDto
) {
}
