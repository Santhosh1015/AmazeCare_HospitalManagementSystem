package com.hms.amazecare.dto.response;

import java.util.List;

public record ExecutiveReportDto(
        List<ExecutiveResDto> executiveResDto,
        PaginationResDto  paginationResDto
) {
}
