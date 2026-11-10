package com.hms.amazecare.dto.response;

import java.util.List;

public record AppointmentReportDto(
        List<AppointmentDetailsResDto> appointmentDetailsResDto,
        PaginationResDto paginationResDto
) {
}
