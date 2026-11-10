package com.hms.amazecare.dto.response;

import java.util.List;

public record PatientAppointmentFilterDto(
       List<PatientAppointmentDto> patientAppointmentList,
       PaginationResDto paginationResDto){
}
