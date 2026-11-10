package com.hms.amazecare.dto.response;

import com.hms.amazecare.enums.Specialization;

public record DoctorSpecializationCountDto(
        Specialization specialization,
        Long count
) {
}
