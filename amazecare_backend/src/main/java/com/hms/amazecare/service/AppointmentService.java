package com.hms.amazecare.service;

import com.hms.amazecare.dto.request.*;
import com.hms.amazecare.dto.response.*;
import com.hms.amazecare.enums.*;
import com.hms.amazecare.exception.AccessDeniedException;
import com.hms.amazecare.exception.InvalidDataException;
import com.hms.amazecare.exception.ResourceNotFoundException;
import com.hms.amazecare.mapper.*;
import com.hms.amazecare.model.*;
import com.hms.amazecare.repository.*;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final Clock clock;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final DoctorAvailabilityService availabilityService;
    private final MedicalRecordRepository medicalRecordRepo;
    private final LabResultRepository labResultRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository itemRepository;
    private final ExecutiveRepository executiveRepository;

    @Transactional
    public BookingRespDto bookAppointment(AppointmentDto appointmentDto ,
                                          String patientUserName) {

        User user = userRepository.findByEmail(patientUserName);
        if (user == null || user.getStatus() != UserStatus.ACTIVE) {
            throw new AccessDeniedException("User not found or inactive");
        }
        if (user.getRole() != Role.PATIENT) {
            throw new AccessDeniedException("Only patients can access this profile");
        }

        // check the doctor existence.
        Doctor doctor = null;
        if(appointmentDto.doctorId() != null){
            doctor = doctorRepository.findById(appointmentDto.doctorId())
                    .orElseThrow(()->new ResourceNotFoundException("DoctorId invalid"));

        }
        // getting the patient, id from the principal
        Patient patient = patientRepository.findByUserId(user.getId());

        // check date
        LocalDate today = LocalDate.now(clock);
        availabilityService.validateBookingDate(appointmentDto.appointmentDate() , today);


        if(doctor != null){
            if(doctor.getUser().getStatus() != UserStatus.ACTIVE){
                throw new InvalidDataException("Doctor is not available for booking");
            }
            // a doctor-specific booking needs an exact time
            if (appointmentDto.appointmentTime() == null) {
                throw new InvalidDataException("Appointment time is required");
            }
            // check the slot is available
            if (!availabilityService.isSlotAvailable(
                    doctor,
                    appointmentDto.appointmentDate(),
                    appointmentDto.appointmentTime())) {
                throw new InvalidDataException("Slot is UnAvailable");
            }
        }
        // map dto to model class
        Appointment appointment = AppointmentMapper.convertDtoIntoEntity(appointmentDto);

        appointment.setPatient(patient);
        appointment.setDoctor(doctor);

        appointment.setStatus(doctor != null ? AppointmentStatus.CONFIRMED : AppointmentStatus.REQUESTED);

        Appointment saved = appointmentRepository.save(appointment);

        log.info("Appointment successfully booked. Appointment ID: {}",saved.getId());

        return AppointmentMapper.createBookingRespDto(saved , doctor);
    }

    @Transactional
    public PatientAppointmentFilterDto viewPatientAppointments(String patientUserName,
                                                               LocalDate date,
                                                               AppointmentStatus status,
                                                               LocalDate fromDate,
                                                               LocalDate toDate,
                                                               Integer page,
                                                               Integer size) {

        Pageable pageable = PageRequest.of(page , size);
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException(  "From date cannot be after to date");
        }

        log.info("Fetched patient appointments successfully");

        Page<PatientAppointmentDto> patientAppointmentDtos = appointmentRepository.getAppointmentByPatient(patientUserName , date, status, fromDate, toDate, pageable);

        return new PatientAppointmentFilterDto(
                patientAppointmentDtos.getContent(),
                new PaginationResDto(patientAppointmentDtos.getTotalPages(),
                        patientAppointmentDtos.getTotalElements(),
                        patientAppointmentDtos.getContent().size())
        );
    }

    @Transactional
    public Page<DoctorAppointmentDto> viewDoctorAppointments(String doctorUserName,
                                                             LocalDate date,
                                                             AppointmentStatus status,
                                                             LocalDate fromDate,
                                                             LocalDate toDate,
                                                             Integer page,
                                                             Integer size) {
        Pageable pageable = PageRequest.of(page , size);
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException( "From date cannot be after to date");
        }
        log.info("Fetched doctor appointments successfully");
        return appointmentRepository.getAppointmentByDoctor(doctorUserName , date, status, fromDate, toDate, pageable);
    }

    @Transactional
    public ExecutiveDashboardFilterDto viewExecutiveAppointments(Boolean assigned,
                                                                   AppointmentStatus status,
                                                                   LocalDate fromDate,
                                                                   LocalDate toDate,
                                                                   Integer page,
                                                                   Integer size) {
        Pageable pageable = PageRequest.of(page , size);
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException( "From date cannot be after to date");
        }
        log.info("Fetched Executive appointments successfully");
        Page<ExecutiveAppointmentDto>  executiveAppointmentDto = appointmentRepository.getAppointmentsByExecutive( assigned , status,fromDate,toDate , pageable);

        return new ExecutiveDashboardFilterDto(
                executiveAppointmentDto.getContent(),
                new PaginationResDto(
                        executiveAppointmentDto.getTotalPages(),
                        executiveAppointmentDto.getTotalElements(),
                        executiveAppointmentDto.getContent().size()
                )
        );

    }

    @Transactional
    public BookingRespDto assignAppointmentToDoctor(String executiveUserName,
                                          AppointmentDto appointmentDto,
                                          Long appointmentId) {
        //1. check appointment ID
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(()-> new ResourceNotFoundException("AppointmentID is invalid"));

        // 1.5 check that appointment is requested
        if(appointment.getStatus() !=AppointmentStatus.REQUESTED){
            throw new InvalidDataException("Only requested appointments can be assigned");
        }

        //2. check doctor ID
        Doctor doctor = doctorRepository.findById(appointmentDto.doctorId())
                .orElseThrow(()-> new ResourceNotFoundException("DoctorID is invalid"));

        if(doctor.getUser().getStatus() != UserStatus.ACTIVE){
            throw new InvalidDataException("Doctor is not available for booking");
        }

        User executive = userRepository.findByEmail(executiveUserName);
        if (executive == null) {
            throw new ResourceNotFoundException("Executive not found");
        }

        // assign the time for the General appointment
        LocalDate date = appointmentDto.appointmentDate() != null
                ? appointmentDto.appointmentDate() : appointment.getAppointmentDate();
        LocalTime time = appointmentDto.appointmentTime() != null
                ? appointmentDto.appointmentTime() : appointment.getAppointmentTime();


        // because date is always given in the general appointment as well
        if (time == null) {
            throw new InvalidDataException("Appointment time is required to assign a doctor");
        }

        availabilityService.validateBookingDate(date , LocalDate.now(clock));
        if(!availabilityService.isSlotAvailable(doctor, date, time)){
            throw new InvalidDataException("Slot is UnAvailable.");
        }

        log.info("Assigning appointment ID: {} to doctor", appointmentId);
        //3. make the assignment by fetch appointment
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(date);
        appointment.setAppointmentTime(time);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        //4. updateBy = executiveUsername
        // here executive is user who updated appointment
        appointment.setUpdatedBy(executive);

        Appointment saved = appointmentRepository.save(appointment);
        return AppointmentMapper.createBookingRespDto(saved, doctor);
    }

    @Transactional
    public BookingRespDto rescheduleAppointment(Long appointmentId,
                                                RescheduleDto rescheduleDto,
                                                String userEmail) {

        // patient / executive can reschedule
        User user = userRepository.findByEmail(userEmail);

        //1. check appointment ID
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(()-> new ResourceNotFoundException("AppointmentID is invalid"));

        // validate the user access
        if(user.getRole() == Role.PATIENT && !appointment.getPatient().getUser().getId().equals(user.getId())){
            throw new AccessDeniedException("Patient can't update another Appointment");
        }

       // check the status to reschedule
        AppointmentStatus status = appointment.getStatus();
        if(status != AppointmentStatus.CONFIRMED && status != AppointmentStatus.REQUESTED){
            throw new InvalidDataException("Only Requested & Confirmed Appointment can be rescheduled");
        }

        //get the date and time to reschedule
        LocalDate date = rescheduleDto.appointmentDate();
        LocalTime time = rescheduleDto.appointmentTime();

        // null-safe comparison (requests have no time)
        if (date.equals(appointment.getAppointmentDate())
                && Objects.equals(time, appointment.getAppointmentTime())) {
            throw new InvalidDataException("The date and time are same as the Existing Appointment");
        }

        // a doctor's appointment must always keep a time
        if (appointment.getDoctor() != null && time == null) {
            throw new InvalidDataException("Time is required to reschedule a doctor's appointment");
        }
        boolean sameSchedule = date.equals(appointment.getAppointmentDate())
                && Objects.equals(time, appointment.getAppointmentTime());
        boolean noOtherChange = rescheduleDto.visitType() == null && rescheduleDto.reason() == null;

        if (sameSchedule && noOtherChange) {
            throw new InvalidDataException("No changes were made to the appointment");
        }

        // then validate the date & time
        availabilityService.validateBookingDate(date , LocalDate.now(clock));

        // ensure slot is available for the rescheduled date & time
        // doctor may be null so that it can be assigned later
        // because we are allowing requested appointment to reschedule
        Doctor doctor = appointment.getDoctor();
        if (doctor != null) {
            doctor = doctorRepository.findById(doctor.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

            if (doctor.getUser().getStatus() != UserStatus.ACTIVE) {
                throw new InvalidDataException("Doctor is not available for booking");
            }
            if (!availabilityService.isSlotAvailable(doctor, date, time)) {
                throw new InvalidDataException("Slot is UnAvailable.");
            }
        }

        appointment.setAppointmentDate(rescheduleDto.appointmentDate());
        appointment.setAppointmentTime(rescheduleDto.appointmentTime());

        if(rescheduleDto.visitType() != null){
            appointment.setVisitType(rescheduleDto.visitType());
        }
        if(rescheduleDto.reason() != null){
            appointment.setReason(rescheduleDto.reason());
        }

        appointment.setUpdatedBy(user);

        Appointment saved = appointmentRepository.save(appointment);
        log.info("appointment id: {} rescheduled successfully",saved.getId());

        return AppointmentMapper.createBookingRespDto(saved , doctor);

    }


    @Transactional
    public void cancelAppointment(String userEmail, CancelAppointmentDto cancelAppointmentDto, Long appointmentId) {

        User user = userRepository.findByEmail(userEmail);
        if (user == null || user.getStatus() != UserStatus.ACTIVE) {
            throw new ResourceNotFoundException("User not found");
        }
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(()-> new ResourceNotFoundException("Invalid AppointmentID"));

        // check this is for authorized User to cancel
        switch(user.getRole()){
            case PATIENT ->{
                if(!appointment.getPatient().getUser().getEmail().equals(userEmail)){
                    throw new AccessDeniedException("Can't Cancel another patient's Appointment");
                }
            }
            case DOCTOR -> {
                // check doctor as null for requested and not assigned
                Doctor doctor = appointment.getDoctor();
                if(doctor == null || !doctor.getUser().getEmail().equals(userEmail)){
                    throw new AccessDeniedException("you can only cancel your's appointments");
                }
            }
            case EXECUTIVE , ADMIN->{}
            default -> throw new AccessDeniedException("Not allowed");
        }

        // update the status
        if(appointment.getStatus() != AppointmentStatus.REQUESTED &&
                appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new InvalidDataException("Appointment can't be cancelled");
        }

        LocalTime time = appointment.getAppointmentTime() != null ? appointment.getAppointmentTime() : LocalTime.MAX;
        if(LocalDateTime.of(appointment.getAppointmentDate(),time).isBefore(LocalDateTime.now(clock))){
            throw new InvalidDataException("Past Appointment can't be cancelled now");
        }

        // executive and doctor, admin need to specify the reason before cancel
        String cancelReason = (cancelAppointmentDto == null || cancelAppointmentDto.cancelReason() == null)
                ? null
                : cancelAppointmentDto.cancelReason().trim();

        if(user.getRole() != Role.PATIENT && cancelReason == null){
            throw new InvalidDataException("Reason for cancel must be given");
        }


        // set the status as CANCEL
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelReason(cancelReason);
        appointment.setUpdatedBy(user);

        log.info("Appointment id: {} cancelled successfully", appointmentId);

        appointmentRepository.save(appointment);
    }


    @Transactional
    public ConsultationResDto completeConsultation(String doctorEmail, Long appointmentId, @Valid ConsultationRequestDto consultationRequestDto) {

        // verify appointment is valid
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(()-> new ResourceNotFoundException("Invalid Appointment Id"));

        // validate the doctor is assigned with appointment
        Doctor doctor = appointment.getDoctor();
        if(doctor == null || !doctor.getUser().getEmail().equals(doctorEmail)){
            throw new AccessDeniedException("Access Denied! Doctor is not assigned with these appointment");
        }

        // check appointment is valid to consult
        if(appointment.getStatus() != AppointmentStatus.CONFIRMED){
            throw new InvalidDataException("Appointment is not CONFIRMED yet.");
        }

        // check the appointment day
        if(appointment.getAppointmentDate().isAfter(LocalDate.now(clock))){
            throw new InvalidDataException("This appointment is not today yet");
        }

        // one medical record per appointment

        if(medicalRecordRepo.existsByAppointmentId(appointmentId)){
            throw new InvalidDataException("A medical record already exists for this appointment");
        }
        // create medical record
        MedicalRecord medicalRecord = AppointmentMapper.createMedicalRecord(consultationRequestDto);
        medicalRecord.setAppointment(appointment);

        medicalRecordRepo.save(medicalRecord);

        List<LabTestName> list = consultationRequestDto.recommendedLabTests() != null ?
                consultationRequestDto.recommendedLabTests():
                List.of();
        List<LabResult> savedLabResults = list.stream()
                                                .distinct()
                                                .map(testType->
                                                        LabResultMapper.createLabResult(
                                                                testType,
                                                                LabTestStatus.RECOMMENDED,
                                                                medicalRecord)
                                                )
                                                .toList();

        labResultRepository.saveAll(savedLabResults);


        // prescription is optional

        Prescription savedPrescription = null;
        List<PrescriptionItem> savedItems = List.of();

        if(consultationRequestDto.prescriptionReqDto() != null){

            savedPrescription= PrescriptionMapper.createPrescription(consultationRequestDto.prescriptionReqDto(), medicalRecord);
            savedPrescription = prescriptionRepository.save(savedPrescription);

            List<PrescribedItemsReqDto> itemsList = consultationRequestDto.prescriptionReqDto().prescribedItems();

            // lambda requires local value passing is need to final
            Prescription finalSavedPrescription = savedPrescription;

            savedItems = itemsList.stream()
                    .map(dto->PrescriptionItemMapper.createPrescriptionItem(dto, finalSavedPrescription))
                    .toList();
            savedItems = itemRepository.saveAll(savedItems);

        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment.setUpdatedBy(doctor.getUser());
        appointmentRepository.save(appointment);

        log.info("consultation completed for appointment ID: {}", appointmentId);
        return ConsultationMapper.createConsultationResDto(appointment, medicalRecord, savedLabResults, savedPrescription, savedItems);
    }

    @Transactional
    public DoctorConsultationResDto getConsultationDetails(Long appointmentId,String userEmail) {

        //validate user
        User user = userRepository.findByEmail(userEmail);
        if (user == null || user.getStatus() != UserStatus.ACTIVE) {
            throw new ResourceNotFoundException("User not found");
        }

        // only doctors can access this endpoint
        if (user.getRole() != Role.DOCTOR) {
            throw new AccessDeniedException( "only doctors can view details");
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                        .orElseThrow(()-> new ResourceNotFoundException( "Appointment not found"));

        Doctor doctor = doctorRepository.findByUserId(user.getId());

        if (doctor == null || appointment.getDoctor() == null || !appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new AccessDeniedException("You are not assigned to this appointment");
        }

        MedicalRecord record =medicalRecordRepo.findByAppointmentId(appointmentId)
                        .orElseThrow(() ->new ResourceNotFoundException("consultation details not found" ));

       // fetch the lab results by the medical records
        List<LabResult> labResults = labResultRepository.fetchByRecordId(record.getId());

        List<LabResultsDto> labsResultList = labResults.stream()
                .map( list -> new LabResultsDto(list.getId(), list.getTestName(), list.getTestStatus(), list.getResultValue(), list.getResultDate()))
                .toList();


        Prescription prescription = prescriptionRepository.fetchPrescriptionByRecordId(record.getId());
        PrescriptionResDto prescriptionDto = null;

        if (prescription != null) {

            List<PrescribedItemResDto> prescribedItems = itemRepository
                            .fetchPrescribedDataById(prescription.getId())
                            .stream()
                            .map(ConsultationMapper::convertPrescribedItemToDto)
                            .toList();

            prescriptionDto = new PrescriptionResDto(
                    prescription.getId(),
                    prescription.getInstructions(),
                    prescribedItems
            );
        }

        return MedicalRecordMapper.createDoctorConsultation( appointment, record,  prescriptionDto, labsResultList);
    }

    @Transactional
    public AppointmentDetailsResDto getAppointmentDetails(String userEmail, Long appointmentId) {
        // validate the user
        User user = userRepository.findByEmail(userEmail);
        if (user == null || user.getStatus() != UserStatus.ACTIVE) {
            throw new ResourceNotFoundException("User not found");
        }

        //fetch the appointment
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() ->new ResourceNotFoundException("Appointment not found"));

        switch (user.getRole()) {

            case PATIENT -> {
                Patient patient = patientRepository.findByUserId(user.getId());
                if (patient == null ||!appointment.getPatient().getId().equals(patient.getId())) {
                    throw new AccessDeniedException( "You are not authorized to view this appointment");
                }
            }
            case DOCTOR -> {
                Doctor doctor = doctorRepository.findByUserId(user.getId());
                if (doctor == null || appointment.getDoctor() == null || !appointment.getDoctor().getId().equals(doctor.getId())) {
                    throw new AccessDeniedException( "You are not assigned to this appointment");
                }
            }
            case ADMIN, EXECUTIVE ->{}

            default -> throw new AccessDeniedException( "You are not authorized ");
        }

        log.info("Appointment details fetched successfully ");
        return AppointmentMapper.createAppointmentDetails(appointment);
    }

    public AdminFilterDto viewAdminAppointments(AppointmentStatus status, LocalDate fromDate, LocalDate toDate, Integer page, Integer size) {

        Pageable pageable = PageRequest.of(page, size);
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException( "From date cannot be after to date");
        }
        Page<Appointment> appointmentList = appointmentRepository.findAdminAppointments(status,fromDate, toDate, pageable);

        log.info("Fetched admin appointments successfully");
        List<AppointmentDetailsResDto> dto = appointmentList
                .stream()
                .map(AppointmentMapper::createAppointmentDetails)
                .toList();

        return new AdminFilterDto(
                dto,
                new PaginationResDto(
                        appointmentList.getTotalPages(),
                        appointmentList.getTotalElements(),
                        appointmentList.getContent().size()
                )

        );
    }

    public BookingRespDto bookAppointmentWD(@Valid AppointmentReqDto dto, String patientUserName) {
        User user = userRepository.findByEmail(patientUserName);
        if (user == null || user.getStatus() != UserStatus.ACTIVE) {
            throw new AccessDeniedException("User not found or inactive");
        }
        if (user.getRole() != Role.PATIENT) {
            throw new AccessDeniedException("Only patients can request appointments");
        }


        // getting the patient, id from the principal
        Patient patient = patientRepository.findByUserId(user.getId());
        if (patient == null) {
            throw new ResourceNotFoundException("Patient not found");
        }

        LocalDate today = LocalDate.now(clock);
        availabilityService.validateBookingDate(dto.appointmentDate(), today);

        // map dto to model class
        Appointment appointment = AppointmentMapper.convertAppointmentReqDto(dto);
        appointment.setPatient(patient);
        appointment.setDoctor(null);
        appointment.setStatus(AppointmentStatus.REQUESTED);

        Appointment saved = appointmentRepository.save(appointment);
        log.info("Appointment requested. Appointment ID: {}", saved.getId());

        return AppointmentMapper.createBookingRespDto(saved, null);
    }

    public ExecutiveDashboardSummaryDto getExecutiveDashboardSummary(String executiveEmail) {

        Executive executive = executiveRepository.findByUserEmail(executiveEmail);

        if (executive == null) {
            throw new ResourceNotFoundException("Executive not found");
        }

        LocalDate today = LocalDate.now(clock);

        long pendingRequests = appointmentRepository.countPendingExecutiveRequests(AppointmentStatus.REQUESTED);

        long todayAppointments = appointmentRepository.countExecutiveTodayAppointments(today);

        long confirmedAppointments = appointmentRepository.countExecutiveAppointmentsByStatus(AppointmentStatus.CONFIRMED);

        long cancelledAppointments = appointmentRepository.countExecutiveAppointmentsByStatus(AppointmentStatus.CANCELLED);

        String executiveName = executive.getFirstName() + " " + executive.getLastName();
        return new ExecutiveDashboardSummaryDto(
                executiveName.trim(),
                pendingRequests,
                todayAppointments,
                confirmedAppointments,
                cancelledAppointments
        );

    }

    public AppointmentReportDto getAppointmentReport(LocalDate fromDate, LocalDate toDate, AppointmentStatus status, Long doctorId, Integer page, Integer size) {

        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException("From date cannot be after to date");
        }
        Pageable pageable = PageRequest.of(page, size);

        Page<AppointmentDetailsResDto> appointmentPage = appointmentRepository.getAppointmentReport(status, fromDate,toDate,doctorId,pageable);

        return new AppointmentReportDto(
                appointmentPage.getContent(),
                new PaginationResDto(
                        appointmentPage.getTotalPages(),
                        appointmentPage.getTotalElements(),
                        appointmentPage.getContent().size()
                )
        );
    }
}
