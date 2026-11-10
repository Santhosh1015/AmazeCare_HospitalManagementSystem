package com.hms.amazecare.dto.response;

import java.util.List;

public record AdminFilterDto(
        List<AppointmentDetailsResDto> adminAppointmentRes,
        PaginationResDto paginationResDto
) {
}
