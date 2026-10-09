package com.hms.amazecare.mapper;

import com.hms.amazecare.dto.request.PatientDto;
import com.hms.amazecare.model.Patient;
import jakarta.validation.Valid;
import org.springframework.stereotype.Component;

@Component
public class PatientMapper {

    public static Patient convertDtoToEntity(@Valid PatientDto patientDto) {
        Patient patient = new Patient();
        patient.setAddress(patientDto.address());
        patient.setGender(patientDto.gender());
        patient.setFirstName(patientDto.firstName());
        patient.setLastName(patientDto.lastName());
        patient.setPhone(patientDto.phone());
        patient.setDateOfBirth(patientDto.dateOfBirth());
        return patient;
    }
}
