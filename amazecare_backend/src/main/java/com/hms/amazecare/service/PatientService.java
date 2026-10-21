package com.hms.amazecare.service;

import com.hms.amazecare.dto.request.PatientDto;
import com.hms.amazecare.dto.request.PatientUpdateDto;
import com.hms.amazecare.dto.response.PatientResDto;
import com.hms.amazecare.enums.Role;
import com.hms.amazecare.enums.UserStatus;
import com.hms.amazecare.exception.ResourceNotFoundException;
import com.hms.amazecare.mapper.PatientMapper;
import com.hms.amazecare.model.Patient;
import com.hms.amazecare.model.User;
import com.hms.amazecare.repository.PatientRepository;
import com.hms.amazecare.repository.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserService userService;
    private final UserRepository userRepository;


    @Transactional
    public PatientResDto registerPatient(@Valid PatientDto patientDto, String authorityUsername) {
        // register a user object before inserting the patient
        User user = userService.createUser(patientDto.email() , patientDto.password() , Role.PATIENT);
        //prepare a patient object
        Patient patient = PatientMapper.convertDtoToEntity(patientDto);

        // insert user into patient
        patient.setUser(user);

        // patient registered by the Admin or executive
        if(authorityUsername != null) {
            patient.setCreatedBy(userRepository.findByEmail(authorityUsername));
        }

        //save it in db
        Patient saved = patientRepository.save(patient);
        return PatientMapper.createPatientResDto(patient);
    }

    @Transactional
    public PatientResDto updatePatientInfo(PatientUpdateDto patientUpdateDto, Long patientId, String authorityUsername) {

        // step 1. checking the id is valid
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(()-> new ResourceNotFoundException("Patient Id is invalid"));

        if(patient.getUser().getStatus() != UserStatus.ACTIVE){
            throw new AccessDeniedException("User is Inactive");
        }
        PatientMapper.convertUpdateDtoToEntity(patientUpdateDto , patient);

        User user = userRepository.findByEmail(authorityUsername);
        if(user.getRole() == Role.PATIENT && !user.getId().equals(patient.getUser().getId())){
            throw new AccessDeniedException("can't update another's profile");
        }

        // set the updated fields
        patient.setFirstName(patientUpdateDto.firstName());
        patient.setLastName(patientUpdateDto.lastName());
        patient.setPhone(patientUpdateDto.phone());
        patient.setAddress(patientUpdateDto.address());
        patient.setDateOfBirth(patientUpdateDto.dateOfBirth());
        // here the updatedBy term uses the User model
        // simple use derived method to get the user
        patient.setUpdatedBy(user);

        Patient saved = patientRepository.save(patient);
        return PatientMapper.createPatientResDto(patient);

    }

    public void deletePatientInfo(Long patientId, String userEmail) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(()-> new ResourceNotFoundException("Patient Id is invalid"));
        if(patient.getUser().getStatus() != UserStatus.ACTIVE){
            throw new AccessDeniedException("User is already Inactive");
        }

        User user = userRepository.findByEmail(userEmail);
        if(user.getRole() != Role.EXECUTIVE && user.getRole() != Role.ADMIN ){
            throw new AccessDeniedException("ADMIN , EXECUTIVE can only delete Patient");
        }

        // call the delete method in user service
        userService.deleteUser(patient.getUser().getId());
    }
}
