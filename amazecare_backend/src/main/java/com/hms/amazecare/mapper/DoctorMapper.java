package com.hms.amazecare.mapper;

import com.hms.amazecare.dto.request.DoctorDto;
import com.hms.amazecare.model.Doctor;
import jakarta.validation.Valid;
import org.springframework.stereotype.Component;

@Component
public class DoctorMapper {

    public static Doctor convertDtoIntoEntity(@Valid DoctorDto doctorDto) {
        Doctor doctor = new Doctor();
        doctor.setDesignation(doctorDto.designation());
        doctor.setFirstName(doctorDto.firstName());
        doctor.setLastName(doctorDto.lastName());
        doctor.setExperienceYears(doctorDto.experienceYears());
        doctor.setQualification(doctorDto.qualification());
        doctor.setLicenseNumber(doctorDto.licenseNumber());
        doctor.setSpecialization(doctorDto.specialization());
        return doctor;
    }
}
