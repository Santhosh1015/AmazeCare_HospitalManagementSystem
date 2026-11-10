package com.hms.amazecare.service;

import com.hms.amazecare.dto.request.PatientDto;
import com.hms.amazecare.dto.request.PatientUpdateDto;
import com.hms.amazecare.dto.response.PatientResDto;
import com.hms.amazecare.enums.Gender;
import com.hms.amazecare.enums.Role;
import com.hms.amazecare.enums.UserStatus;
import org.springframework.security.access.AccessDeniedException;
import com.hms.amazecare.model.Patient;
import com.hms.amazecare.model.User;
import com.hms.amazecare.repository.PatientRepository;
import com.hms.amazecare.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserService userService;

    @InjectMocks
    private PatientService patientService;

    @Test
    void registerPatientTest() {

        String authorityUsername = "admin@gmail.com";

        PatientDto patientDto = new PatientDto(
                "patient@gmail.com",
                "Password123",
                "name1",
                "name2",
                Gender.MALE,
                "9876543210",
                "Coimbatore",
                LocalDate.of(2000, 1, 1)
        );

        User patientUser = new User();
        patientUser.setId(1L);
        patientUser.setEmail(patientDto.email());
        patientUser.setRole(Role.PATIENT);
        patientUser.setStatus(UserStatus.ACTIVE);

        User adminUser = new User();
        adminUser.setEmail(authorityUsername);
        adminUser.setRole(Role.ADMIN);
        adminUser.setStatus(UserStatus.ACTIVE);

        when(userService.createUser(
                patientDto.email(),
                patientDto.password(),
                Role.PATIENT
        )).thenReturn(patientUser);

        when(userRepository.findByEmail(authorityUsername)).thenReturn(adminUser);

        when(patientRepository.save(any(Patient.class)))
                .thenAnswer(invocation -> {
                    Patient patient = invocation.getArgument(0);
                    patient.setId(1L);
                    return patient;
                });

        PatientResDto response = patientService.registerPatient(patientDto, authorityUsername);


        assertEquals(1L, response.patientId());

        verify(userService, times(1)).createUser(patientDto.email(), patientDto.password(), Role.PATIENT);
        verify(userRepository, times(1)).findByEmail(authorityUsername);
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    void updatePatientInfoTest() {

        Long patientId = 1L;
        String userEmail = "patient@gmail.com";

        PatientUpdateDto patientUpdateDto = new PatientUpdateDto("name1", "name2", "9876543210", "Coimbatore", LocalDate.of(2000, 1, 1));

        User patientUser = new User();
        patientUser.setId(patientId);
        patientUser.setEmail(userEmail);
        patientUser.setRole(Role.PATIENT);
        patientUser.setStatus(UserStatus.ACTIVE);

        Patient patient = new Patient();
        patient.setId(patientId);
        patient.setUser(patientUser);

        User authorityUser = new User();
        authorityUser.setId(patientId);
        authorityUser.setEmail(userEmail);
        authorityUser.setRole(Role.PATIENT);
        authorityUser.setStatus(UserStatus.ACTIVE);

        when(patientRepository.findById(patientId)).thenReturn(Optional.of(patient));
        when(userRepository.findByEmail(userEmail)).thenReturn(authorityUser);
        when(patientRepository.save(any(Patient.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PatientResDto response = patientService.updatePatientInfo(patientUpdateDto, patientId, userEmail);
        assertNotNull(response);

        verify(patientRepository, times(1)).findById(patientId);
        verify(userRepository, times(1)).findByEmail(userEmail);
        verify(patientRepository, times(1)).save(any(Patient.class));
    }
    @Test
    void updatePatientInfo_Invalid() {

        Long patientId = 1L;
        String userEmail = "patient@gmail.com";

        PatientUpdateDto patientUpdateDto = new PatientUpdateDto("name1", "name2", "9876543210", "Coimbatore", LocalDate.of(2000, 1, 1));

        User patientUser = new User();
        patientUser.setId(1L);
        patientUser.setEmail("anotherpatient@gmail.com");
        patientUser.setRole(Role.PATIENT);
        patientUser.setStatus(UserStatus.ACTIVE);

        Patient patient = new Patient();
        patient.setId(patientId);
        patient.setUser(patientUser);

        User authorityUser = new User();
        authorityUser.setId(2L);
        authorityUser.setEmail(userEmail);
        authorityUser.setRole(Role.PATIENT);
        authorityUser.setStatus(UserStatus.ACTIVE);

        when(patientRepository.findById(patientId)).thenReturn(Optional.of(patient));
        when(userRepository.findByEmail(userEmail)).thenReturn(authorityUser);

        assertThrows(AccessDeniedException.class, () -> patientService.updatePatientInfo(patientUpdateDto, patientId, userEmail));

        verify(patientRepository, times(1)).findById(patientId);
        verify(userRepository, times(1)).findByEmail(userEmail);
        verify(patientRepository, never()).save(any(Patient.class));
    }
}
