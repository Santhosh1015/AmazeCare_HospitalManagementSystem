package com.hms.amazecare.dto.response;

import java.util.List;

public record DoctorReportDto(
        List<DoctorProfileResDto> doctorProfileResDto,
        PaginationResDto  paginationResDto
) {
}
