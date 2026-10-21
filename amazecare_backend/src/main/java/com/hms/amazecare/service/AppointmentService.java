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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
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
    private final PrescriptionItemRepository prescriptionItemRepository;

    @Transactional
    public BookingRespDto bookAppointment(AppointmentDto appointmentDto ,
                                          String patientUserName) {

        // check the doctor existence.
        Doctor doctor = null;
        if(appointmentDto.doctorId() != null){
            doctor = doctorRepository.findById(appointmentDto.doctorId())
                    .orElseThrow(()->new ResourceNotFoundException("DoctorId invalid"));

        }
        // getting the patient, id from the principal
        Patient patient = patientRepository.getPatientByUsername(patientUserName);

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

        return AppointmentMapper.createBookingRespDto(saved , doctor);
    }

    @Transactional
    public List<PatientAppointmentDto> viewPatientAppointments(String patientUserName,
                                                               LocalDate date,
                                                               AppointmentStatus status,
                                                               LocalDate fromDate,
                                                               LocalDate toDate,
                                                               Integer page,
                                                               Integer size) {

        Pageable pageable = PageRequest.of(page , size);
        return appointmentRepository.getAppointmentByPatient(patientUserName , date, status, fromDate, toDate, pageable);
    }

    @Transactional
    public List<DoctorAppointmentDto> viewDoctorAppointments(String doctorUserName,
                                                             LocalDate date,
                                                             AppointmentStatus status,
                                                             LocalDate fromDate,
                                                             LocalDate toDate,
                                                             Integer page,
                                                             Integer size) {
        Pageable pageable = PageRequest.of(page , size);
        return appointmentRepository.getAppointmentByDoctor(doctorUserName , date, status, fromDate, toDate, pageable);
    }

    @Transactional
    public List<ExecutiveAppointmentDto> viewExecutiveAppointments(Boolean assigned,
                                                                   AppointmentStatus status,
                                                                   LocalDate fromDate,
                                                                   LocalDate toDate,
                                                                   Integer page,
                                                                   Integer size) {
        Pageable pageable = PageRequest.of(page , size);
        return appointmentRepository.getAppointmentsByExecutive( assigned , status,fromDate,toDate);

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
        if(date.equals(appointment.getAppointmentDate()) && time.equals(appointment.getAppointmentTime())){
            throw new InvalidDataException("The date and time are same as the Existing Appointment");
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

        return AppointmentMapper.createBookingRespDto(saved , doctor);

    }


    @Transactional
    public void cancelAppointment(String userEmail, CancelAppointmentDto cancelAppointmentDto, Long appointmentId) {

        User user = userRepository.findByEmail(userEmail);

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
                    throw new AccessDeniedException("you can only cancel your appointment");
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
                                    ? null :
                                    appointment.getCancelReason().trim();

        if(user.getRole() != Role.PATIENT && cancelReason == null){
            throw new InvalidDataException("Reason for cancel must be given");
        }


        // set the status as CANCEL
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelReason(cancelReason);
        appointment.setUpdatedBy(user);

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
        medicalRecord.setPatient(appointment.getPatient());
        medicalRecord.setDoctor(doctor);

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
            savedItems = prescriptionItemRepository.saveAll(savedItems);

        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment.setUpdatedBy(doctor.getUser());
        appointmentRepository.save(appointment);

        return ConsultationMapper.createConsultationResDto(appointment, medicalRecord, savedLabResults, savedPrescription, savedItems);
    }
}
