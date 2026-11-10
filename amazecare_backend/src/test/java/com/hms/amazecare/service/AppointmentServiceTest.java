package com.hms.amazecare.service;

import com.hms.amazecare.dto.request.AppointmentDto;
import com.hms.amazecare.dto.request.CancelAppointmentDto;
import com.hms.amazecare.dto.request.ConsultationRequestDto;
import com.hms.amazecare.dto.request.RescheduleDto;
import com.hms.amazecare.dto.response.BookingRespDto;
import com.hms.amazecare.dto.response.ConsultationResDto;
import com.hms.amazecare.enums.AppointmentStatus;
import com.hms.amazecare.enums.Role;
import com.hms.amazecare.enums.UserStatus;
import com.hms.amazecare.enums.VisitType;
import com.hms.amazecare.exception.AccessDeniedException;
import com.hms.amazecare.exception.InvalidDataException;
import com.hms.amazecare.exception.ResourceNotFoundException;
import com.hms.amazecare.model.*;
import com.hms.amazecare.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.*;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private PatientRepository patientRepository;
    @Mock
    private DoctorRepository doctorRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private DoctorAvailabilityService availabilityService;
    @Mock
    private Clock clock;
    @Mock
    private MedicalRecordRepository medicalRecordRepo;
    @Mock
    private LabResultRepository labResultRepository;



    @InjectMocks
    private AppointmentService appointmentService;

    @Test
    void bookAppointmentTest() {
        String patientEmail = "patient@gmail.com";
        AppointmentDto appointmentDto = new AppointmentDto(2L, LocalDate.of(2026, 11, 9), LocalTime.of(10, 0), VisitType.CONSULTATION, "");

        User patientUser = new User();
        patientUser.setId(1L);
        patientUser.setEmail(patientEmail);
        patientUser.setRole(Role.PATIENT);
        patientUser.setStatus(UserStatus.ACTIVE);

        Patient patient = new Patient();
        patient.setId(1L);
        patient.setUser(patientUser);


        User doctorUser = new User();
        doctorUser.setId(2L);
        doctorUser.setEmail("doctor@gmail.com");
        doctorUser.setRole(Role.DOCTOR);
        doctorUser.setStatus(UserStatus.ACTIVE);

        Doctor doctor = new Doctor();
        doctor.setId(2L);
        doctor.setUser(doctorUser);


        Appointment  appointment = new Appointment();
        appointment.setId(1L);
        appointment.setAppointmentDate(appointmentDto.appointmentDate());
        appointment.setAppointmentTime(appointmentDto.appointmentTime());
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setStatus(AppointmentStatus.CONFIRMED);

        when(userRepository.findByEmail(patientEmail)).thenReturn(patientUser);
        when(patientRepository.findByUserId(1L)).thenReturn(patient);

        when(doctorRepository.findById(2L)).thenReturn(Optional.of(doctor));
        when(clock.instant())
                .thenReturn(Instant.parse("2026-11-02T00:00:00Z"));

        when(clock.getZone())
                .thenReturn(ZoneId.of("UTC"));
        when(availabilityService.isSlotAvailable(doctor, appointmentDto.appointmentDate(), appointmentDto.appointmentTime())).thenReturn(true);

        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        BookingRespDto response = appointmentService.bookAppointment(appointmentDto, patientEmail);

        verify(userRepository, times(1)).findByEmail(patientEmail);
        verify(patientRepository, times(1)).findByUserId(1L);
        verify(doctorRepository, times(1)).findById(2L);
        verify(availabilityService, times(1)).isSlotAvailable(doctor, appointmentDto.appointmentDate(), appointmentDto.appointmentTime());
        verify(appointmentRepository, times(1)).save(any(Appointment.class));

        verifyNoMoreInteractions(patientRepository);
        verifyNoMoreInteractions(doctorRepository);
        verifyNoMoreInteractions(appointmentRepository);
    }
    @Test
    void bookAppointmentTest_GeneralAppointment() {

        String patientEmail = "patient@gmail.com";
        AppointmentDto appointmentDto = new AppointmentDto(null, LocalDate.of(2026, 11, 9), null, VisitType.CONSULTATION, "General consultation");

        User patientUser = new User();
        patientUser.setId(1L);
        patientUser.setEmail(patientEmail);
        patientUser.setRole(Role.PATIENT);
        patientUser.setStatus(UserStatus.ACTIVE);

        Patient patient = new Patient();
        patient.setId(1L);
        patient.setUser(patientUser);

        Appointment savedAppointment = new Appointment();
        savedAppointment.setId(11L);
        savedAppointment.setAppointmentDate(appointmentDto.appointmentDate());
        savedAppointment.setVisitType(appointmentDto.visitType());
        savedAppointment.setReason(appointmentDto.reason());
        savedAppointment.setPatient(patient);
        savedAppointment.setDoctor(null);
        savedAppointment.setStatus(AppointmentStatus.REQUESTED);

        when(userRepository.findByEmail(patientEmail)).thenReturn(patientUser);
        when(patientRepository.findByUserId(1L)).thenReturn(patient);

        when(clock.instant()).thenReturn(Instant.parse("2026-11-02T00:00:00Z"));
        when(clock.getZone()).thenReturn(ZoneId.of("UTC"));

        when(appointmentRepository.save(any(Appointment.class))).thenReturn(savedAppointment);

        // Act
        BookingRespDto response = appointmentService.bookAppointment(appointmentDto, patientEmail);

        assertEquals(11L, response.appointmentId());

        verify(userRepository, times(1)).findByEmail(patientEmail);
        verify(patientRepository, times(1)).findByUserId(1L);

        verify(appointmentRepository, times(1))
                .save(any(Appointment.class));

        verifyNoMoreInteractions(patientRepository);
        verifyNoMoreInteractions(doctorRepository);
        verifyNoMoreInteractions(appointmentRepository);
    }

    @Test
    void bookAppointmentTest_UnavailableSlot() {

        String patientEmail = "patient@gmail.com";

        AppointmentDto appointmentDto = new AppointmentDto(2L, LocalDate.of(2026, 11, 9), LocalTime.of(10, 0), VisitType.CONSULTATION, "Consultation");

        User patientUser = new User();
        patientUser.setId(1L);
        patientUser.setRole(Role.PATIENT);
        patientUser.setStatus(UserStatus.ACTIVE);

        User doctorUser = new User();
        doctorUser.setId(2L);
        doctorUser.setRole(Role.DOCTOR);
        doctorUser.setStatus(UserStatus.ACTIVE);

        Doctor doctor = new Doctor();
        doctor.setId(2L);
        doctor.setUser(doctorUser);

        when(userRepository.findByEmail(patientEmail)).thenReturn(patientUser);
        when(doctorRepository.findById(2L)).thenReturn(Optional.of(doctor));
        when(patientRepository.findByUserId(1L)).thenReturn(new Patient());
        when(clock.instant()).thenReturn(Instant.parse("2026-11-02T00:00:00Z"));
        when(clock.getZone()).thenReturn(ZoneId.of("UTC"));

        //return false for the unavailable slots
        when(availabilityService.isSlotAvailable(doctor, appointmentDto.appointmentDate(), appointmentDto.appointmentTime()))
                .thenReturn(false);

        assertThrows(InvalidDataException.class, () -> appointmentService.bookAppointment(appointmentDto, patientEmail));

        verify(availabilityService, times(1)).isSlotAvailable(doctor, appointmentDto.appointmentDate(), appointmentDto.appointmentTime());

        verifyNoInteractions(appointmentRepository);
    }

    @Test
    void bookAppointmentTest_InvalidRole() {

        String userEmail = "admin@gmail.com";
        AppointmentDto appointmentDto = new AppointmentDto(null, LocalDate.of(2026, 11, 9), null, VisitType.CONSULTATION, "General consultation");

        User user = new User();
        user.setId(1L);
        user.setEmail(userEmail);
        // role as admin
        user.setRole(Role.ADMIN);
        user.setStatus(UserStatus.ACTIVE);

        when(userRepository.findByEmail(userEmail)).thenReturn(user);


        assertThrows(AccessDeniedException.class, () -> appointmentService.bookAppointment(appointmentDto, userEmail));

        verify(userRepository, times(1)).findByEmail(userEmail);

        verifyNoInteractions(
                patientRepository,
                doctorRepository,
                appointmentRepository,
                availabilityService
        );
    }
    @Test
    void viewPatientAppointmentsTest() {
        String patientEmail = "patient@gmail.com";

        Pageable pageable = PageRequest.of(0,5);
        when(appointmentRepository.getAppointmentByPatient(
                eq(patientEmail), any(), any(), any(), any(), eq(pageable))).thenReturn(any(Page.class));
//        assertEquals(0, appointmentService.viewPatientAppointments(
//                patientEmail, null, null, null, null, 0, 5
//        ).getsize());

        verify(appointmentRepository, times(1)).getAppointmentByPatient(
                patientEmail, null, null, null, null, PageRequest.of(0, 5)
        );
    }

    @Test
    void viewPatientAppointmentsTest_InvalidDateRange() {
        LocalDate fromDate = LocalDate.of(2026, 11, 10);
        LocalDate toDate = LocalDate.of(2026, 11, 5);

        assertThrows(IllegalArgumentException.class,() -> appointmentService.viewPatientAppointments(
                "patient@gmail.com",
                null,
                null,
                fromDate,
                toDate,
                0,
                5
                )
        );

        verifyNoMoreInteractions(appointmentRepository);
    }
    @Test
    void viewPatientAppointmentsTest_InvalidPage() {

        String patientEmail = "patient@gmail.com";

        assertThrows(IllegalArgumentException.class, () -> appointmentService.viewPatientAppointments(
                        patientEmail,
                        null,
                        null,
                        null,
                        null,
                        -1,
                        5
                )
        );

        verifyNoInteractions(appointmentRepository);
    }

    @Test
    void assignAppointmentToDoctorTest() {

        String executiveEmail = "executive@gmail.com";
        Long appointmentId = 1L;

        AppointmentDto appointmentDto = new AppointmentDto(2L, LocalDate.of(2026, 11, 9), LocalTime.of(10, 0), VisitType.CONSULTATION, "");

        User executive = new User();
        executive.setId(3L);
        executive.setEmail(executiveEmail);
        executive.setRole(Role.EXECUTIVE);
        executive.setStatus(UserStatus.ACTIVE);

        User doctorUser = new User();
        doctorUser.setId(2L);
        doctorUser.setEmail("doctor@gmail.com");
        doctorUser.setRole(Role.DOCTOR);
        doctorUser.setStatus(UserStatus.ACTIVE);

        Doctor doctor = new Doctor();
        doctor.setId(2L);
        doctor.setUser(doctorUser);

        // time as null cause doctor not assigned yet
        Appointment appointment = new Appointment();
        appointment.setId(appointmentId);
        appointment.setAppointmentDate(appointmentDto.appointmentDate());
        appointment.setAppointmentTime(null);
        appointment.setStatus(AppointmentStatus.REQUESTED);

        Appointment savedAppointment = new Appointment();
        savedAppointment.setId(appointmentId);
        savedAppointment.setAppointmentDate(appointmentDto.appointmentDate());
        savedAppointment.setAppointmentTime(appointmentDto.appointmentTime());
        savedAppointment.setDoctor(doctor);
        savedAppointment.setStatus(AppointmentStatus.CONFIRMED);
        savedAppointment.setUpdatedBy(executive);

        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        when(doctorRepository.findById(2L)).thenReturn(Optional.of(doctor));

        when(userRepository.findByEmail(executiveEmail)).thenReturn(executive);

        when(clock.instant()).thenReturn(Instant.parse("2026-11-02T00:00:00Z"));
        when(clock.getZone()).thenReturn(ZoneId.of("UTC"));

        when(availabilityService.isSlotAvailable(
                doctor, appointmentDto.appointmentDate(), appointmentDto.appointmentTime()
        )).thenReturn(true);

        when(appointmentRepository.save(appointment)).thenReturn(savedAppointment);

        BookingRespDto response = appointmentService.assignAppointmentToDoctor(executiveEmail, appointmentDto, appointmentId);

        assertEquals(appointmentId, response.appointmentId());

        verify(appointmentRepository, times(1)).findById(appointmentId);
        verify(doctorRepository, times(1)).findById(2L);
        verify(userRepository, times(1)).findByEmail(executiveEmail);

        verify(availabilityService, times(1)).validateBookingDate(appointmentDto.appointmentDate(), LocalDate.of(2026, 11, 2));
        verify(availabilityService, times(1)).isSlotAvailable(doctor, appointmentDto.appointmentDate(), appointmentDto.appointmentTime());

        verify(appointmentRepository, times(1)).save(appointment);

        verifyNoMoreInteractions(appointmentRepository,
                patientRepository,
                doctorRepository,
                userRepository);
    }
    @Test
    void assignAppointmentToDoctorTest_Invalid() {

        Long appointmentId = 99L;
        AppointmentDto appointmentDto = new AppointmentDto(2L, LocalDate.of(2026, 11, 9), LocalTime.of(10, 0), VisitType.CONSULTATION, "");

        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.empty());



        assertThrows(ResourceNotFoundException.class, () -> appointmentService.assignAppointmentToDoctor("executive@gmail.com", appointmentDto, appointmentId));

        verify(appointmentRepository, times(1)).findById(appointmentId);

        verifyNoInteractions(
                doctorRepository,
                userRepository,
                availabilityService
        );
    }

    @Test
    void rescheduleAppointmentTest() {

        Long appointmentId = 1L;
        String patientEmail = "patient@gmail.com";

        LocalDate newDate = LocalDate.of(2026, 11, 10);
        LocalTime newTime = LocalTime.of(11, 0);

        RescheduleDto rescheduleDto = new RescheduleDto(newDate, newTime, VisitType.CONSULTATION, "");

        User patientUser = new User();
        patientUser.setId(1L);
        patientUser.setEmail(patientEmail);
        patientUser.setRole(Role.PATIENT);
        patientUser.setStatus(UserStatus.ACTIVE);

        Patient patient = new Patient();
        patient.setId(1L);
        patient.setUser(patientUser);

        User doctorUser = new User();
        doctorUser.setId(2L);
        doctorUser.setStatus(UserStatus.ACTIVE);

        Doctor doctor = new Doctor();
        doctor.setId(2L);
        doctor.setUser(doctorUser);

        Appointment appointment = new Appointment();
        appointment.setId(appointmentId);
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(LocalDate.of(2026, 11, 9));
        appointment.setAppointmentTime(LocalTime.of(10, 0));
        appointment.setStatus(AppointmentStatus.CONFIRMED);

        Appointment savedAppointment = new Appointment();
        savedAppointment.setId(appointmentId);
        savedAppointment.setPatient(patient);
        savedAppointment.setDoctor(doctor);
        savedAppointment.setAppointmentDate(newDate);
        savedAppointment.setAppointmentTime(newTime);
        savedAppointment.setStatus(AppointmentStatus.CONFIRMED);

        when(userRepository.findByEmail(patientEmail)).thenReturn(patientUser);

        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        when(doctorRepository.findById(2L)).thenReturn(Optional.of(doctor));

        when(clock.instant()).thenReturn(Instant.parse("2026-11-02T00:00:00Z"));
        when(clock.getZone()).thenReturn(ZoneId.of("UTC"));

        when(availabilityService.isSlotAvailable(doctor, newDate, newTime))
                .thenReturn(true);

        when(appointmentRepository.save(appointment))
                .thenReturn(savedAppointment);

        // Act
        BookingRespDto response =
                appointmentService.rescheduleAppointment(
                        appointmentId, rescheduleDto, patientEmail
                );

        assertEquals(appointmentId, response.appointmentId());
        assertEquals(newDate, response.appointmentDate());
        assertEquals(newTime, response.appointmentTime());

        verify(userRepository, times(1)).findByEmail(patientEmail);

        verify(appointmentRepository, times(1)).findById(appointmentId);

        verify(doctorRepository, times(1)).findById(2L);
        verify(availabilityService, times(1)).validateBookingDate(newDate, LocalDate.of(2026, 11, 2));

        verify(availabilityService, times(1)).isSlotAvailable(doctor, newDate, newTime);
        verify(appointmentRepository, times(1)).save(appointment);
    }

    @Test
    void rescheduleAppointmentTest_Invalid() {

        Long appointmentId = 1L;
        String patientEmail = "patient@gmail.com";

        LocalDate existingDate = LocalDate.of(2026, 11, 9);
        LocalTime existingTime = LocalTime.of(10, 0);

        RescheduleDto rescheduleDto = new RescheduleDto(existingDate, existingTime, VisitType.CONSULTATION, "Rescheduled consultation");

        User patientUser = new User();
        patientUser.setId(1L);
        patientUser.setEmail(patientEmail);
        patientUser.setRole(Role.PATIENT);
        patientUser.setStatus(UserStatus.ACTIVE);

        Patient patient = new Patient();
        patient.setId(1L);
        patient.setUser(patientUser);

        Appointment appointment = new Appointment();
        appointment.setId(appointmentId);
        appointment.setPatient(patient);
        appointment.setAppointmentDate(existingDate);
        appointment.setAppointmentTime(existingTime);
        appointment.setStatus(AppointmentStatus.CONFIRMED);

        when(userRepository.findByEmail(patientEmail)).thenReturn(patientUser);

        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        assertThrows(InvalidDataException.class, () -> appointmentService.rescheduleAppointment(appointmentId, rescheduleDto, patientEmail)
        );

        verify(userRepository, times(1)).findByEmail(patientEmail);

        verify(appointmentRepository, times(1)).findById(appointmentId);
        verify(appointmentRepository, times(0))
                .save(any(Appointment.class));
        verifyNoInteractions(
                doctorRepository,
                availabilityService
        );


    }

    @Test
    void cancelAppointmentTest() {

        String userEmail = "patient@gmail.com";
        Long appointmentId = 1L;

        User user = new User();
        user.setStatus(UserStatus.ACTIVE);
        user.setRole(Role.PATIENT);
        user.setEmail(userEmail);

        Patient patient = new Patient();
        patient.setUser(user);

        when(clock.instant()).thenReturn(Instant.parse("2026-11-02T10:00:00Z"));
        when(clock.getZone()).thenReturn(ZoneId.of("UTC"));

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setAppointmentDate(LocalDate.now(clock).plusDays(2));
        appointment.setAppointmentTime(LocalTime.of(10, 0));

        when(userRepository.findByEmail(userEmail)).thenReturn(user);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));


        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        CancelAppointmentDto dto = null;

        appointmentService.cancelAppointment(userEmail, dto, appointmentId);

        assertEquals(AppointmentStatus.CANCELLED, appointment.getStatus());

        verify(userRepository, times(1)).findByEmail(userEmail);
        verify(appointmentRepository, times(1)).findById(appointmentId);
        verify(appointmentRepository, times(1)).save(appointment);

        verifyNoMoreInteractions(userRepository,
                appointmentRepository);

     }

    @Test
    void cancelAppointment_Invalid() {

        String userEmail = "patient@gmail.com";
        Long appointmentId = 1L;

        User user = new User();
        user.setStatus(UserStatus.ACTIVE);
        user.setRole(Role.PATIENT);
        user.setEmail(userEmail);

        Patient patient = new Patient();
        patient.setUser(user);

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setStatus(AppointmentStatus.COMPLETED);

        CancelAppointmentDto dto = null;

        when(userRepository.findByEmail(userEmail)).thenReturn(user);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        assertThrows(InvalidDataException.class, () -> appointmentService.cancelAppointment(userEmail, dto, appointmentId));

        verify(userRepository, times(1)).findByEmail(userEmail);
        verify(appointmentRepository, times(1)).findById(appointmentId);
        verify(appointmentRepository, times(0)).save(any(Appointment.class));
    }

    @Test
    void completeConsultationTest() {

        String doctorEmail = "doctor@gmail.com";
        Long appointmentId = 1L;

        User doctorUser = new User();
        doctorUser.setEmail(doctorEmail);

        Doctor doctor = new Doctor();
        doctor.setUser(doctorUser);

        Patient patient = new Patient();

        when(clock.instant()).thenReturn(Instant.parse("2026-11-02T10:00:00Z"));
        when(clock.getZone()).thenReturn(ZoneId.of("UTC"));

        Appointment appointment = new Appointment();
        appointment.setId(appointmentId);
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setAppointmentDate(LocalDate.now(clock));
        appointment.setAppointmentTime(LocalTime.of(10, 0));

        ConsultationRequestDto dto = new ConsultationRequestDto("test1", "exam1", "diagnosis1", "plan1", List.of(), null);

        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(medicalRecordRepo.existsByAppointmentId(appointmentId)).thenReturn(false);

        //Returning that same object allows the test to continue without needing a database.
        when(medicalRecordRepo.save(any(MedicalRecord.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(labResultRepository.saveAll(anyList())).thenReturn(List.of());

        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        ConsultationResDto response = appointmentService.completeConsultation(doctorEmail, appointmentId, dto);

        assertEquals(AppointmentStatus.COMPLETED, appointment.getStatus());
        assertEquals(appointmentId, response.appointmentId());

        verify(appointmentRepository, times(1)).findById(appointmentId);
        verify(medicalRecordRepo, times(1)).existsByAppointmentId(appointmentId);
        verify(medicalRecordRepo, times(1)).save(any(MedicalRecord.class));
        verify(labResultRepository, times(1)).saveAll(anyList());
        verify(appointmentRepository, times(1)).save(appointment);
    }
}
