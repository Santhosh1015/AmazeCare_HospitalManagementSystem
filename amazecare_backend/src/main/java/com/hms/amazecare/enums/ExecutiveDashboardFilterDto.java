package com.hms.amazecare.enums;

import com.hms.amazecare.dto.response.ExecutiveAppointmentDto;
import com.hms.amazecare.dto.response.PaginationResDto;

import java.util.List;

public record ExecutiveDashboardFilterDto(

        List<ExecutiveAppointmentDto> executiveAppointmentDto,
        PaginationResDto paginationResDto
) {
}
