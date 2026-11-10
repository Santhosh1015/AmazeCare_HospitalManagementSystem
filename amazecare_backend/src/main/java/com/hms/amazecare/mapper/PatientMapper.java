package com.hms.amazecare.mapper;

import com.hms.amazecare.dto.request.PatientDto;
import com.hms.amazecare.dto.request.PatientUpdateDto;
import com.hms.amazecare.dto.response.PatientResDto;
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

    public static void convertUpdateDtoToEntity(PatientUpdateDto patientUpdateDto, Patient patient) {
        patient.setAddress(patientUpdateDto.address());
        patient.setFirstName(patientUpdateDto.firstName());
        patient.setLastName(patientUpdateDto.lastName());
        patient.setPhone(patientUpdateDto.phone());
        patient.setDateOfBirth(patientUpdateDto.dateOfBirth());

    }

    public static PatientResDto createPatientResDto(Patient patient) {
        return new PatientResDto(
                patient.getId(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getPhone(),
                patient.getAddress(),
                patient.getDateOfBirth(),
                patient.getGender()
        );
    }
}
