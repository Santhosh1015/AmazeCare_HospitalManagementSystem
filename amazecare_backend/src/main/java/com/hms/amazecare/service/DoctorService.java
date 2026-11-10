package com.hms.amazecare.service;

import com.hms.amazecare.dto.request.DoctorDto;
import com.hms.amazecare.dto.request.UpdateDoctorDto;
import com.hms.amazecare.dto.response.*;
import com.hms.amazecare.enums.AppointmentStatus;
import com.hms.amazecare.enums.Role;
import com.hms.amazecare.enums.Specialization;
import com.hms.amazecare.enums.UserStatus;
import com.hms.amazecare.exception.AccessDeniedException;
import com.hms.amazecare.exception.ResourceNotFoundException;
import com.hms.amazecare.mapper.DoctorMapper;
import com.hms.amazecare.mapper.PatientMapper;
import com.hms.amazecare.model.Doctor;
import com.hms.amazecare.model.Patient;
import com.hms.amazecare.model.User;
import com.hms.amazecare.repository.*;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorService {
    private final DoctorRepository doctorRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final Clock clock;

    public DoctorProfileResDto registerDoctor(@Valid DoctorDto doctorDto, String authorityUsername) {
        //preparing the user object
        User user = userService.createUser(
                doctorDto.email(),
                doctorDto.password(),
                Role.DOCTOR
        );

        // map the dto to entity
        Doctor doctor = DoctorMapper.convertDtoIntoEntity(doctorDto);

        doctor.setUser(user);

        // get the user by the authority, who is logged-in (ADMIN , EXECUTIVE)
        doctor.setCreatedBy(userRepository.findByEmail(authorityUsername));

        log.info("Doctor registered successfully with email: {}", doctorDto.email());
        return DoctorMapper.convertEntityToDto(doctorRepository.save(doctor));

    }

    public DoctorProfileResDto updateDoctorProfile(String userEmail, Long doctorId, @Valid UpdateDoctorDto doctorDto) {

        // check the user for update
        User user = userRepository.findByEmail(userEmail);
         if(user.getRole() != Role.EXECUTIVE &&user.getRole() != Role.ADMIN){
             throw new AccessDeniedException("Only Executive and Admin can make Update");
         }

        Doctor doctor = doctorRepository.findById(doctorId)
                        .orElseThrow(()->new ResourceNotFoundException("Doctor Id is invalid"));
         if(doctor.getUser().getStatus() != UserStatus.ACTIVE){
             throw new AccessDeniedException("User is Inactive");
         }

        // update the fields
        doctor.setQualification(doctorDto.qualification());
        doctor.setSpecialization(doctorDto.specialization());
        doctor.setLicenseNumber(doctorDto.licenseNumber());
        doctor.setExperienceYears(doctorDto.experienceYears());
        doctor.setLastName(doctorDto.lastName());
        doctor.setFirstName(doctorDto.firstName());
        doctor.setDesignation(doctorDto.designation());

        // set the updatedBy field
        doctor.setUpdatedBy(user);

        log.info("Doctor profile updated successfully. Doctor ID: {}", doctorId);
       return DoctorMapper.convertEntityToDto(doctorRepository.save(doctor));
    }

    public DoctorsViewDto viewDoctors(Specialization specialization, LocalDate date, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);
        DayOfWeek day  = (date == null ) ? null : date.getDayOfWeek();
        Page<DoctorProfileResDto> doctorProfileResDtos =  doctorRepository.viewDoctors(specialization , day, pageable);

        return new DoctorsViewDto(
                doctorProfileResDtos.getContent(),
                new PaginationResDto(
                        doctorProfileResDtos.getTotalPages(),
                        doctorProfileResDtos.getTotalElements(),
                        doctorProfileResDtos.getContent().size()
                )
        );
    }

    public DoctorProfileResDto viewDoctorProfile(String userEmail) {

        User user = userRepository.findByEmail(userEmail);

        if (user == null || user.getStatus() != UserStatus.ACTIVE) {
            throw new AccessDeniedException("User not found or inactive");
        }

        if (user.getRole() != Role.DOCTOR) {
            throw new AccessDeniedException("Only doctors can access this profile");
        }

        Doctor doctor = doctorRepository.findByUserEmail(userEmail);

        if (doctor == null) {
            throw new ResourceNotFoundException("Doctor profile not found");
        }
        return DoctorMapper.convertEntityToDto(doctor);
    }


    public void deleteDoctor(Long doctorId, String userEmail) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(()-> new ResourceNotFoundException("Doctor Id is invalid"));
        if(doctor.getUser().getStatus() != UserStatus.ACTIVE){
            throw new AccessDeniedException("User is already Inactive");
        }

        User user = userRepository.findByEmail(userEmail);
        if(user.getRole() != Role.EXECUTIVE && user.getRole() != Role.ADMIN ){
            throw new AccessDeniedException("ADMIN , EXECUTIVE can only delete Doctor");
        }

        // call the delete method in user service
        userService.deleteUser(doctor.getUser().getId());
    }

    public DoctorProfileResDto viewDoctorById(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(()-> new ResourceNotFoundException("Doctor Id is invalid"));
        if(doctor.getUser().getStatus() != UserStatus.ACTIVE){
            throw new AccessDeniedException("User is already Inactive");
        }
        return DoctorMapper.convertEntityToDto(doctor);
    }

    @Transactional
    public DoctorPatientsDto fetchDoctorPatients(String userEmail, Integer page, Integer size) {

        // verify the users
        User user = userRepository.findByEmail(userEmail);
        if (user == null || user.getStatus() != UserStatus.ACTIVE) {
            throw new AccessDeniedException("User not found or inactive");
        }

        // check the role of the users
        if (user.getRole() != Role.DOCTOR) {
            throw new AccessDeniedException("Only doctors can access this profile");
        }

        Doctor doctor = doctorRepository.findByUserEmail(userEmail);
        if (doctor == null) {
            throw new ResourceNotFoundException("Doctor profile not found");
        }

        Pageable pageable = PageRequest.of(page, size);

        Page<Patient>  patientList = patientRepository.fetchPatientsByDoctor(doctor.getId(), pageable);

        List<PatientResDto> patientResDtos =  patientList
                .stream()
                .map(PatientMapper::createPatientResDto)
                .toList();
//        log.info("total page in patientre {}",p.getTotalElements());
        return new DoctorPatientsDto(
                patientResDtos,
                new PaginationResDto(
                        patientList.getTotalPages(),
                        patientList.getTotalElements(),
                        patientList.getContent().size()
                )
        );
    }

    public DoctorReportDto getDoctorReport(Specialization specialization, LocalDate fromDate, LocalDate toDate, Integer page, Integer size) {

        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException("From date cannot be after to date");
        }

        Pageable pageable = PageRequest.of(page, size);

        LocalDateTime startDate = fromDate != null
                ? fromDate.atStartOfDay()
                : null;

        LocalDateTime endDate = toDate != null
                ? toDate.atTime(LocalTime.MAX)
                : null;

        Page<DoctorProfileResDto> doctorPage = doctorRepository.getDoctorReport(specialization, startDate, endDate, pageable);

        PaginationResDto paginationResDto = new PaginationResDto(
                doctorPage.getTotalPages(),
                doctorPage.getTotalElements(),
                doctorPage.getContent().size()
        );

        return new DoctorReportDto(doctorPage.getContent(), paginationResDto);
    }

    public DoctorDashboardSummaryDto fetchDashboardSummary(String userEmail) {

        User user = userRepository.findByEmail(userEmail);

        if (user == null || user.getStatus() != UserStatus.ACTIVE) {
            throw new AccessDeniedException("User not found or inactive");
        }

        if (user.getRole() != Role.DOCTOR) {
            throw new AccessDeniedException("Only doctors can access this dashboard");
        }

        Doctor doctor = doctorRepository.findByUserEmail(userEmail);

        if (doctor == null) {
            throw new ResourceNotFoundException("Doctor profile not found");
        }

        Long doctorId = doctor.getId();
        LocalDate today = LocalDate.now(clock);

        Long totalPatients = patientRepository.countPatientsByDoctor(doctorId);

        Long todayAppointments = appointmentRepository.countByDoctorAndAppointmentDate(doctorId, today);

        Long completedAppointments = appointmentRepository.countByDoctorAndAppointmentDateAndStatus(doctorId, today, AppointmentStatus.COMPLETED);

        Long pendingAppointments = appointmentRepository.countByDoctorAndAppointmentDateAndStatusIn(
                doctorId, today, List.of(
                        AppointmentStatus.REQUESTED,
                        AppointmentStatus.CONFIRMED
                )
        );

        Long cancelledAppointments = appointmentRepository.countByDoctorAndAppointmentDateAndStatus(
                doctorId, today, AppointmentStatus.CANCELLED
        );

        Long noShowAppointments = appointmentRepository.countByDoctorAndAppointmentDateAndStatus(
                doctorId, today, AppointmentStatus.NO_SHOW
        );

        List<AppointmentDetailsResDto> todayAppointmentList =
                appointmentRepository.fetchTodayAppointments(doctorId, today);


        return new DoctorDashboardSummaryDto(
                doctor.getFirstName() + " " + doctor.getLastName(),
                doctor.getSpecialization().name(),
                totalPatients,
                todayAppointments,
                completedAppointments,
                pendingAppointments,
                cancelledAppointments,
                noShowAppointments,
                todayAppointmentList
        );
    }
}
