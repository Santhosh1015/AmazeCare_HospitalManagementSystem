package com.hms.amazecare.dto.response;

import java.util.List;

public record DoctorsViewDto(
        List<DoctorProfileResDto> doctorProfileResDtos,
        PaginationResDto paginationResDto
) {
}
