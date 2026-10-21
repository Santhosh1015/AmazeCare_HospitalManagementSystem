package com.hms.amazecare.dto.response;

import com.hms.amazecare.enums.DoctorDesignation;
import com.hms.amazecare.enums.Specialization;

public record DoctorProfileResDto(
        Long doctorId,
        String firstName,
        String lastName,
        Specialization specialization,
        String qualification,
        DoctorDesignation designation,
        String licenseNumber,
        Integer experienceYears
) {
}
