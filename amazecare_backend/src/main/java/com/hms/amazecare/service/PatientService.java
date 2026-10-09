package com.hms.amazecare.service;

import com.hms.amazecare.dto.request.PatientDto;
import com.hms.amazecare.enums.Role;
import com.hms.amazecare.mapper.PatientMapper;
import com.hms.amazecare.model.Patient;
import com.hms.amazecare.model.User;
import com.hms.amazecare.repository.PatientRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserService userService;


    public void registerPatient(@Valid PatientDto patientDto) {
        // register a user object before inserting the patient
        User user = userService.createUser(patientDto.email() , patientDto.password() , Role.PATIENT);
        //prepare a patient object
        Patient patient = PatientMapper.convertDtoToEntity(patientDto);

        // insert user into patient

        patient.setUser(user);

        //save it in db
        patientRepository.save(patient);

    }
}
