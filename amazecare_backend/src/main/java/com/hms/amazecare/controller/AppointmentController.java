package com.hms.amazecare.controller;

import com.hms.amazecare.dto.request.*;
import com.hms.amazecare.dto.response.*;
import com.hms.amazecare.enums.AppointmentStatus;
import com.hms.amazecare.enums.ExecutiveDashboardFilterDto;
import com.hms.amazecare.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    private final AppointmentService appointmentService;

    //patient can only book appointment, principal = patient
    @PostMapping("/api/v1/appointment/book")
    public ResponseEntity<BookingRespDto> bookAppointment(@Valid @RequestBody AppointmentDto appointmentDto,
                                                         Principal principal){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointmentService.bookAppointment(appointmentDto , principal.getName()));

    }
    @PostMapping("/api/v2/appointment/book")
    public ResponseEntity<BookingRespDto> bookAppointmentWD(@Valid @RequestBody AppointmentReqDto appointmentReqDto,
                                                          Principal principal){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointmentService.bookAppointmentWD(appointmentReqDto , principal.getName()));

    }

    @GetMapping("/api/v1/appointments/patient")
    public PatientAppointmentFilterDto viewPatientAppointments(Principal principal,
                                                               @RequestParam(name = "date", required = false) LocalDate date,
                                                               @RequestParam(name = "status" , required = false) AppointmentStatus status,
                                                               @RequestParam(name = "fromDate" , required = false) LocalDate fromDate,
                                                               @RequestParam(name = "toDate" , required = false) LocalDate toDate,
                                                               @RequestParam(name = "page" , required = false , defaultValue = "0") Integer page,
                                                               @RequestParam(name = "size" , required = false , defaultValue = "10") Integer size){
        return appointmentService.viewPatientAppointments(principal.getName(), date, status, fromDate, toDate, page, size);
    }

    @GetMapping("/api/v1/appointments/doctor")
    public Page<DoctorAppointmentDto> viewDoctorAppointments(
            Principal principal,
            @RequestParam(name = "date", required = false) LocalDate date,
            @RequestParam(name = "status" , required = false) AppointmentStatus status,
            @RequestParam(name = "fromDate" , required = false) LocalDate fromDate,
            @RequestParam(name = "toDate" , required = false) LocalDate toDate,
            @RequestParam(name = "page" , required = false , defaultValue = "0") Integer page,
            @RequestParam(name = "size" , required = false , defaultValue = "10") Integer size){
        return appointmentService.viewDoctorAppointments(principal.getName(), date, status, fromDate, toDate, page, size);
    }

    @GetMapping("/api/v1/appointments/executive")
    public ExecutiveDashboardFilterDto viewExecutiveAppointments(
            @RequestParam(name = "assigned" ,required = false) Boolean assigned,
            @RequestParam(name = "status" , required = false) AppointmentStatus status,
            @RequestParam(name = "fromDate" , required = false) LocalDate fromDate,
            @RequestParam(name = "toDate" , required = false) LocalDate toDate,
            @RequestParam(name = "page" , required = false , defaultValue = "0") Integer page,
            @RequestParam(name = "size" , required = false , defaultValue = "10") Integer size){
        return appointmentService.viewExecutiveAppointments( assigned, status, fromDate, toDate, page, size);
    }


    @GetMapping("/api/v1/appointments/admin")
    public AdminFilterDto viewAdminAppointments(
            @RequestParam(name = "status", required = false) AppointmentStatus status,
            @RequestParam(name = "fromDate", required = false) LocalDate fromDate,
            @RequestParam(name = "toDate", required = false) LocalDate toDate,
            @RequestParam(name = "page", required = false, defaultValue = "0") Integer page,
            @RequestParam(name = "size", required = false, defaultValue = "10") Integer size) {

        return appointmentService.viewAdminAppointments(status, fromDate, toDate, page, size);
    }
    // after sees the appointment is unassigned
    @PutMapping("/api/v1/appointment/assign/{appointmentId}")
    public ResponseEntity<BookingRespDto> assignDoctorToAppointment(@Valid @PathVariable Long appointmentId,
                                          @RequestBody AppointmentDto appointmentDto,
                                          Principal principal){
        return  ResponseEntity
                .status(HttpStatus.CREATED)
                .body(appointmentService.assignAppointmentToDoctor(principal.getName(), appointmentDto , appointmentId));
    }

    // can be done by patient executive, admin
    @PutMapping("/api/v1/appointment/reschedule/{appointmentId}")
    public  ResponseEntity<BookingRespDto> rescheduleAppointment(@Valid @PathVariable Long appointmentId,
                                                                 @RequestBody RescheduleDto rescheduleDto,
                                                                 Principal principal
    ){
        return ResponseEntity.ok()
                .body(appointmentService.rescheduleAppointment(appointmentId, rescheduleDto, principal.getName()));
    }

    @PutMapping("/api/v1/appointment/cancel/{appointmentId}")
    public void cancelAppointment(@RequestBody(required = false) CancelAppointmentDto cancelAppointmentDto,
                                  @PathVariable Long appointmentId,
                                  Principal principal){
        appointmentService.cancelAppointment(principal.getName(), cancelAppointmentDto, appointmentId);
    }

    @PutMapping("/api/v1/appointment/consultation/{appointmentId}")
    public ResponseEntity<ConsultationResDto> completeConsultation(@Valid @RequestBody ConsultationRequestDto consultationRequestDto,
                                                   @PathVariable Long appointmentId,
                                                   Principal principal){
        return ResponseEntity
                .ok()
                .body(appointmentService.completeConsultation(principal.getName(), appointmentId, consultationRequestDto));
    }

    @GetMapping("/api/v1/appointments/{appointmentId}/consultation")
    public DoctorConsultationResDto getConsultationDetails(@PathVariable Long appointmentId, Principal principal) {
        return appointmentService.getConsultationDetails(appointmentId, principal.getName());
    }

    @GetMapping("/api/v1/appointments/{appointmentId}")
    public AppointmentDetailsResDto getAppointmentDetails(Principal principal,
                                                          @PathVariable Long appointmentId){
        return appointmentService.getAppointmentDetails(principal.getName(), appointmentId);
    }

    @GetMapping("/api/v1/appointments/executive/summary")
    public ExecutiveDashboardSummaryDto getExecutiveDashboardSummary(Principal principal) {

        return appointmentService.getExecutiveDashboardSummary(principal.getName());
    }

    @GetMapping("/api/v1/admin/reports/appointments")
    public AppointmentReportDto getAppointmentReport(  @RequestParam(name = "fromDate", required = false) LocalDate fromDate,
                                                       @RequestParam(name = "toDate", required = false) LocalDate toDate,
                                                       @RequestParam(name = "status", required = false) AppointmentStatus status,
                                                       @RequestParam(name = "doctorId", required = false) Long doctorId,
                                                       @RequestParam(name = "page", required = false, defaultValue = "0") Integer page,
                                                       @RequestParam(name = "size", required = false, defaultValue = "10") Integer size) {

        return appointmentService.getAppointmentReport(fromDate, toDate, status, doctorId, page, size);
    }



}
