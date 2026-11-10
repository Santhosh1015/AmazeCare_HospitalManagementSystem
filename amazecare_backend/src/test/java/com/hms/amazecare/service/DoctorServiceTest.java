package com.hms.amazecare.service;

import com.hms.amazecare.dto.request.DoctorDto;
import com.hms.amazecare.dto.request.UpdateDoctorDto;
import com.hms.amazecare.dto.response.DoctorPatientsDto;
import com.hms.amazecare.dto.response.DoctorProfileResDto;
import com.hms.amazecare.dto.response.DoctorsViewDto;
import com.hms.amazecare.dto.response.PatientResDto;
import com.hms.amazecare.enums.*;
import com.hms.amazecare.exception.AccessDeniedException;
import com.hms.amazecare.model.Doctor;
import com.hms.amazecare.model.Patient;
import com.hms.amazecare.model.User;
import com.hms.amazecare.repository.DoctorRepository;
import com.hms.amazecare.repository.PatientRepository;
import com.hms.amazecare.repository.UserRepository;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DoctorServiceTest {

    @Mock
    private DoctorRepository doctorRepository;
    @Mock
    private UserService userService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private DoctorService doctorService;

    @Test
    void registerDoctorTest() {

        DoctorDto doctorDto = new DoctorDto("name1", "name2", Specialization.CARDIOLOGY, "qualification", DoctorDesignation.CONSULTANT, "id123", 5, "doctor@gmail.com", "Password123");

        String authorityUsername = "admin@gmail.com";

        User doctorUser = new User();
        doctorUser.setId(1L);
        doctorUser.setEmail(doctorDto.email());
        doctorUser.setRole(Role.DOCTOR);
        doctorUser.setStatus(UserStatus.ACTIVE);

        User adminUser = new User();
        adminUser.setEmail(authorityUsername);
        adminUser.setRole(Role.ADMIN);

        when(userService.createUser(doctorDto.email(),doctorDto.password(), Role.DOCTOR)).thenReturn(doctorUser);

        when(userRepository.findByEmail(authorityUsername)).thenReturn(adminUser);

        when(doctorRepository.save(any(Doctor.class)))
                .thenAnswer(invocation -> {
                    Doctor doctor = invocation.getArgument(0);
                    doctor.setId(10L);
                    return doctor;
                });

        DoctorProfileResDto result =
                doctorService.registerDoctor(doctorDto, authorityUsername);

        assertNotNull(result);
        assertEquals(10L, result.doctorId());
        assertEquals("name1", result.firstName());
        assertEquals("name2", result.lastName());
        assertEquals(Specialization.CARDIOLOGY, result.specialization());

        verify(userService, times(1)).createUser(
                doctorDto.email(),
                doctorDto.password(),
                Role.DOCTOR
        );

        verify(userRepository, times(1))
                .findByEmail(authorityUsername);

        verify(doctorRepository, times(1))
                .save(any(Doctor.class));
    }
    @Test
    void updateDoctorProfileTest() {
        String userEmail = "admin@gmail.com";
        Long doctorId = 1L;
        UpdateDoctorDto doctorDto = new UpdateDoctorDto("name1", "name2", Specialization.CARDIOLOGY, "qualification", DoctorDesignation.CONSULTANT, "id123", 5);

        User adminUser = new User();
        adminUser.setEmail(userEmail);
        adminUser.setRole(Role.ADMIN);

        User doctorUser = new User();
        doctorUser.setId(10L);
        doctorUser.setStatus(UserStatus.ACTIVE);

        Doctor doctor = new Doctor();
        doctor.setId(doctorId);
        doctor.setUser(doctorUser);

        when(userRepository.findByEmail(userEmail)).thenReturn(adminUser);
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(doctorRepository.save(any(Doctor.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DoctorProfileResDto result = doctorService.updateDoctorProfile(userEmail, doctorId, doctorDto);

        assertNotNull(result);
        assertEquals(doctorId, result.doctorId());
        assertEquals(Specialization.CARDIOLOGY, result.specialization());
        assertEquals(DoctorDesignation.CONSULTANT, result.designation());
        assertEquals("id123", result.licenseNumber());
        assertEquals(5, result.experienceYears());

        verify(userRepository, times(1)).findByEmail(userEmail);
        verify(doctorRepository, times(1)).findById(doctorId);
        verify(doctorRepository, times(1)).save(any(Doctor.class));

        assertEquals(adminUser, doctor.getUpdatedBy());
    }
    @Test
    void updateDoctorProfileInvalidTest() {
        String userEmail = "patient@gmail.com";
        Long doctorId = 1L;
        UpdateDoctorDto doctorDto = new UpdateDoctorDto("name1", "name2", Specialization.CARDIOLOGY, "qualification", DoctorDesignation.CONSULTANT, "id123", 5);

        User patientUser = new User();
        patientUser.setEmail(userEmail);
        patientUser.setRole(Role.PATIENT);

        when(userRepository.findByEmail(userEmail))
                .thenReturn(patientUser);

        assertThrows(AccessDeniedException.class, () -> doctorService.updateDoctorProfile(userEmail, doctorId, doctorDto));

        verify(userRepository, times(1)).findByEmail(userEmail);
        verify(doctorRepository, never()).findById(anyLong());
        verify(doctorRepository, never()).save(any(Doctor.class));
    }

    @Test
    void viewDoctorsTest() {
        Pageable pageable = PageRequest.of(0, 5);
        LocalDate date = LocalDate.of(2026, 11, 9);   // a Monday

        DoctorProfileResDto dto = new DoctorProfileResDto(
                1L, "name1", "name2", Specialization.CARDIOLOGY,
                "qualification", DoctorDesignation.CONSULTANT, "id123", 5);

        Page<DoctorProfileResDto> doctorPage = new PageImpl<>(List.of(dto), pageable, 1);

        when(doctorRepository.viewDoctors(Specialization.CARDIOLOGY, DayOfWeek.MONDAY, pageable))
                .thenReturn(doctorPage);

        DoctorsViewDto response = doctorService.viewDoctors(Specialization.CARDIOLOGY, date, 0, 5);

        assertNotNull(response);

        verify(doctorRepository).viewDoctors(Specialization.CARDIOLOGY, DayOfWeek.MONDAY, pageable);
    }
    @Test
    void viewDoctorProfileTest() {

        String userEmail = "doctor@gmail.com";

        User doctorUser = new User();
        doctorUser.setEmail(userEmail);
        doctorUser.setRole(Role.DOCTOR);
        doctorUser.setStatus(UserStatus.ACTIVE);

        Doctor doctor = new Doctor();
        doctor.setId(1L);
        doctor.setFirstName("name1");
        doctor.setLastName("name2");
        doctor.setSpecialization(Specialization.CARDIOLOGY);
        doctor.setQualification("qualification");
        doctor.setDesignation(DoctorDesignation.CONSULTANT);
        doctor.setLicenseNumber("id123");
        doctor.setExperienceYears(5);
        doctor.setUser(doctorUser);

        when(userRepository.findByEmail(userEmail)).thenReturn(doctorUser);

        when(doctorRepository.findByUserEmail(userEmail)).thenReturn(doctor);

        DoctorProfileResDto response = doctorService.viewDoctorProfile(userEmail);

        assertEquals(1L, response.doctorId());

        verify(userRepository, times(1)).findByEmail(userEmail);
        verify(doctorRepository, times(1)).findByUserEmail(userEmail);

        verifyNoMoreInteractions(userRepository,doctorRepository);
    }
    @Test
    void viewDoctorProfile_Invalid() {

        String userEmail = "patient@gmail.com";

        User patientUser = new User();
        patientUser.setEmail(userEmail);
        patientUser.setRole(Role.PATIENT);
        patientUser.setStatus(UserStatus.ACTIVE);

        when(userRepository.findByEmail(userEmail)).thenReturn(patientUser);

        assertThrows(AccessDeniedException.class, () -> doctorService.viewDoctorProfile(userEmail));

        verify(userRepository, times(1)).findByEmail(userEmail);
        verify(doctorRepository, never()).findByUserEmail(userEmail);
    }

    @Test
    void deleteDoctorTest() {

        Long doctorId = 1L;
        String userEmail = "admin@gmail.com";

        User doctorUser = new User();
        doctorUser.setId(2L);
        doctorUser.setEmail("doctor@gmail.com");
        doctorUser.setRole(Role.DOCTOR);
        doctorUser.setStatus(UserStatus.ACTIVE);

        Doctor doctor = new Doctor();
        doctor.setId(doctorId);
        doctor.setUser(doctorUser);

        User adminUser = new User();
        adminUser.setEmail(userEmail);
        adminUser.setRole(Role.ADMIN);
        adminUser.setStatus(UserStatus.ACTIVE);

        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(userRepository.findByEmail(userEmail)).thenReturn(adminUser);

        doctorService.deleteDoctor(doctorId, userEmail);

        verify(doctorRepository, times(1)).findById(doctorId);
        verify(userRepository, times(1)).findByEmail(userEmail);
        verify(userService, times(1)).deleteUser(2L);
    }
    // patient can't delete doctor
    @Test
    void deleteDoctor_Invalid() {

        Long doctorId = 1L;
        String userEmail = "patient@gmail.com";

        User doctorUser = new User();
        doctorUser.setId(2L);
        doctorUser.setEmail("doctor@gmail.com");
        doctorUser.setRole(Role.DOCTOR);
        doctorUser.setStatus(UserStatus.ACTIVE);

        Doctor doctor = new Doctor();
        doctor.setId(doctorId);
        doctor.setUser(doctorUser);

        User patientUser = new User();
        patientUser.setEmail(userEmail);
        patientUser.setRole(Role.PATIENT);
        patientUser.setStatus(UserStatus.ACTIVE);

        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(userRepository.findByEmail(userEmail)).thenReturn(patientUser);

        assertThrows(AccessDeniedException.class, () -> doctorService.deleteDoctor(doctorId, userEmail));

        verify(doctorRepository, times(1)).findById(doctorId);
        verify(userRepository, times(1)).findByEmail(userEmail);
        verify(userService, never()).deleteUser(anyLong());
    }

    @Test
    void fetchDoctorPatientsTest() {

        String userEmail = "doctor@gmail.com";

        User doctorUser = new User();
        doctorUser.setEmail(userEmail);
        doctorUser.setRole(Role.DOCTOR);
        doctorUser.setStatus(UserStatus.ACTIVE);

        Doctor doctor = new Doctor();
        doctor.setId(1L);
        doctor.setUser(doctorUser);

        Patient patient = new Patient();
        patient.setId(1L);
        patient.setFirstName("name1");
        patient.setLastName("name2");
        patient.setPhone("9876543210");
        patient.setAddress("Coimbatore");
        patient.setDateOfBirth(LocalDate.of(2000, 1, 1));
        patient.setGender(Gender.MALE);

        Pageable pageable = PageRequest.of(0, 5);

        when(userRepository.findByEmail(userEmail)).thenReturn(doctorUser);
        when(doctorRepository.findByUserEmail(userEmail)).thenReturn(doctor);
//        when(patientRepository.fetchPatientsByDoctor(doctor.getId(), pageable)).thenReturn(Page<patient>);

        DoctorPatientsDto response = doctorService.fetchDoctorPatients(userEmail, 0, 5);

//        assertEquals(1, response);
//        assertEquals("name1", response.getContent().getFirst().firstName());

        verify(userRepository, times(1)).findByEmail(userEmail);
        verify(doctorRepository, times(1)).findByUserEmail(userEmail);
        verify(patientRepository, times(1)).fetchPatientsByDoctor(doctor.getId(), pageable);

        verifyNoMoreInteractions(userRepository,doctorRepository, patientRepository);
    }


}
