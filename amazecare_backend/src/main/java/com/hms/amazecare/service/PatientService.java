package com.hms.amazecare.service;

import com.hms.amazecare.dto.request.PatientDto;
import com.hms.amazecare.dto.request.PatientUpdateDto;
import com.hms.amazecare.dto.response.*;
import com.hms.amazecare.enums.AppointmentStatus;
import com.hms.amazecare.enums.Gender;
import com.hms.amazecare.enums.Role;
import com.hms.amazecare.enums.UserStatus;
import com.hms.amazecare.exception.ResourceNotFoundException;
import com.hms.amazecare.mapper.PatientMapper;
import com.hms.amazecare.model.Patient;
import com.hms.amazecare.model.User;
import com.hms.amazecare.repository.AppointmentRepository;
import com.hms.amazecare.repository.PatientRepository;
import com.hms.amazecare.repository.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;


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
        return PatientMapper.createPatientResDto(patient );
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
        if (user == null || user.getStatus() != UserStatus.ACTIVE) {
            throw new AccessDeniedException("User not found or inactive");
        }

        if( user.getRole() == Role.PATIENT && !user.getId().equals(patient.getUser().getId())){
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

    @Transactional
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

    @Transactional
    public PatientResDto fetchPatientProfile(String userEmail) {
        //fetch the user and verify
        User user = userRepository.findByEmail(userEmail);
        if (user == null || user.getStatus() != UserStatus.ACTIVE) {
            throw new AccessDeniedException("User not found or inactive");
        }
        if (user.getRole() != Role.PATIENT) {
            throw new AccessDeniedException("Only patients can access this profile");
        }

        Patient patient = patientRepository.findByUserId(user.getId());

        if (patient == null) {
            throw new RuntimeException("Patient profile not found");
        }

        return PatientMapper.createPatientResDto(patient);
    }

    @Transactional
    public PatientViewDto fetchPatients(String userEmail, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page , size);

        Page<Patient> patientList = patientRepository.findAll(pageable);

        List<PatientResDto> patientResDtos = patientList
                .stream()
                .map(PatientMapper:: createPatientResDto)
                .toList();
        return new PatientViewDto(
                patientResDtos,
                new PaginationResDto(
                        patientList.getTotalPages(),
                        patientList.getTotalElements(),
                        patientList.getContent().size()
                )
        );
    }

    public PatientResDto fetchPatientById(Long patientId) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        return PatientMapper.createPatientResDto(patient);
    }

    @Transactional
    public PatientDashboardSummaryDto fetchDashboardSummary(String userEmail) {

        Patient patient = patientRepository.findByUserEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Patient profile not found"));

        if (patient.getUser().getStatus() != UserStatus.ACTIVE ||
                patient.getUser().getRole() != Role.PATIENT) {
            throw new AccessDeniedException("Only active patients can access dashboard");
        }

        LocalDate today = LocalDate.now();
        LocalTime currentTime = LocalTime.now();

        long upcoming = appointmentRepository.countUpcomingAppointments(
                userEmail, AppointmentStatus.CONFIRMED, today, currentTime
        );

        long completed = appointmentRepository.countByPatientEmailAndStatus(
                userEmail, AppointmentStatus.COMPLETED
        );

        long cancelled = appointmentRepository.countByPatientEmailAndStatus(
                userEmail, AppointmentStatus.CANCELLED
        );

        long pending = appointmentRepository.countByPatientEmailAndStatus(
                userEmail, AppointmentStatus.REQUESTED
        );

        String patientName = patient.getFirstName() + " " + patient.getLastName();

        return new PatientDashboardSummaryDto(
                patientName,
                upcoming,
                completed,
                cancelled,
                pending
        );
    }

    public PatientReportDto getPatientReport(Gender gender, LocalDate fromDate, LocalDate toDate, Integer page, Integer size) {

       if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException("From date cannot be after to date");
        }

        Pageable pageable = PageRequest.of(page, size);

        LocalDateTime startDate = fromDate != null? fromDate.atStartOfDay() : null;
        LocalDateTime endDate = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        Page<Patient> patientPage = patientRepository.getPatientReport(gender, startDate, endDate, pageable);

        List<PatientResDto> patients = patientPage.getContent()
                .stream()
                .map(PatientMapper::createPatientResDto)
                .toList();

        PaginationResDto paginationResDto = new PaginationResDto(
                patientPage.getTotalPages(),
                patientPage.getTotalElements(),
                patientPage.getContent().size()
        );

        return new PatientReportDto(patients, paginationResDto);
    }
}
