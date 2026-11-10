package com.hms.amazecare.dto.response;

import java.util.List;

public record PatientViewDto(
        List<PatientResDto> patientResDto,
        PaginationResDto paginationResDto
) {
}
