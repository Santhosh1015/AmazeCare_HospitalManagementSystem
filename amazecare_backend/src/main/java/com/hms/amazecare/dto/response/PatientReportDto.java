package com.hms.amazecare.dto.response;

import java.util.List;

public record PatientReportDto(
        List<PatientResDto> patientResDto,
        PaginationResDto paginationResDto
) {
}
