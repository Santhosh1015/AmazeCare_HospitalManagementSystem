package com.hms.amazecare.controller;

import com.hms.amazecare.dto.request.DoctorDto;
import com.hms.amazecare.dto.request.UpdateDoctorDto;
import com.hms.amazecare.dto.response.*;
import com.hms.amazecare.enums.Specialization;
import com.hms.amazecare.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.cglib.core.Local;
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
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping("/api/v1/doctor/add")
    public ResponseEntity<DoctorProfileResDto> registerDoctor(@Valid @RequestBody DoctorDto doctorDto,
                                                              Principal principal){
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(doctorService.registerDoctor(doctorDto , principal.getName()));
    }

    @PutMapping("/api/v1/doctor/{doctorId}/update")
    public ResponseEntity<DoctorProfileResDto> updateDoctor(@Valid @RequestBody UpdateDoctorDto doctorDto,
                                                            @PathVariable Long doctorId,
                                                            Principal principal){
        return ResponseEntity
                .ok()
                .body(doctorService.updateDoctorProfile(principal.getName(),doctorId, doctorDto));
    }

    //use cases:
    // 1. helps to assign doctor by executive
    // 2. fetch by the patient to see doctors
    @GetMapping("/api/v1/doctors")
    public DoctorsViewDto viewDoctors(@RequestParam(name = "specialization" , required = false)Specialization specialization,
                                      @RequestParam(name = "date", required = false ) LocalDate date,
                                      @RequestParam(name = "page", required = false , defaultValue = "0")Integer page,
                                      @RequestParam(name = "size", required = false , defaultValue = "10")Integer size) {
       return doctorService.viewDoctors(specialization , date ,page , size);
    }

    @GetMapping("/api/v1/doctor/profile")
    public DoctorProfileResDto viewDoctorProfile(Principal principal) {
        return doctorService.viewDoctorProfile(principal.getName());
    }
    @GetMapping("/api/v1/doctor/{doctorId}")
    public DoctorProfileResDto viewDoctorProfile(@PathVariable Long doctorId) {
        return doctorService.viewDoctorById(doctorId);
    }

    @PutMapping("/api/v1/doctor/{doctorId}/delete")
    public void deleteDoctor(@PathVariable Long  doctorId,
                                  Principal principal){
        doctorService.deleteDoctor(doctorId , principal.getName());
    }

    @GetMapping("/api/v1/doctor/me/patients")
    public DoctorPatientsDto fetchDoctorPatients(Principal principal,
                                                 @RequestParam(name = "page", required = false, defaultValue = "0") Integer page,
                                                 @RequestParam(name = "size", required = false, defaultValue = "10") Integer size) {

        return doctorService.fetchDoctorPatients(principal.getName(), page, size);
    }

    // Admin doctor report
    @GetMapping("/api/v1/doctors/admin/report")
    public DoctorReportDto getDoctorReport(@RequestParam(name = "specialization", required = false) Specialization specialization,
                                           @RequestParam(name = "fromDate", required = false) LocalDate fromDate,
                                           @RequestParam(name = "toDate", required = false) LocalDate toDate,
                                           @RequestParam(name = "page", required = false, defaultValue = "0") Integer page,
                                           @RequestParam(name = "size", required = false, defaultValue = "10") Integer size) {

        return doctorService.getDoctorReport(specialization, fromDate, toDate, page, size);
    }

    @GetMapping("/api/v1/doctors/dashboard/summary")
    public DoctorDashboardSummaryDto fetchDashboardSummary(Principal principal) {
        return doctorService.fetchDashboardSummary(principal.getName());
    }

}
