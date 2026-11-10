package com.hms.amazecare.controller;

import com.hms.amazecare.dto.request.PatientDto;
import com.hms.amazecare.dto.request.PatientUpdateDto;
import com.hms.amazecare.dto.response.PatientDashboardSummaryDto;
import com.hms.amazecare.dto.response.PatientReportDto;
import com.hms.amazecare.dto.response.PatientResDto;
import com.hms.amazecare.dto.response.PatientViewDto;
import com.hms.amazecare.enums.Gender;
import com.hms.amazecare.model.Patient;
import com.hms.amazecare.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PatientController {

    private final PatientService patientService;

    //self-registration of patient
    @PostMapping("/api/v1/patient/register")
    public ResponseEntity<PatientResDto> registerPatientInfo(@Valid @RequestBody PatientDto patientDto){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(patientService.registerPatient(patientDto ,null));
    }

    // for the patient registered by the admin, executive
    @PostMapping("/api/v1/patient/staff-register")
    public ResponseEntity<PatientResDto> registerPatientInfo(@Valid @RequestBody PatientDto patientDto,
                                    Principal principal){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(patientService.registerPatient(patientDto ,principal.getName()));
    }

    // it can done by PATIENT , ADMIN , EXECUTIVE
    @PutMapping("/api/v1/patient/update/{patientId}")
    public ResponseEntity<PatientResDto> updatePatientInfo( @Valid @RequestBody PatientUpdateDto patientUpdateDto,
                                  @PathVariable Long  patientId,
                                   Principal principal){
        return ResponseEntity.ok()
                .body(patientService.updatePatientInfo(patientUpdateDto , patientId , principal.getName()));

    }
    // both admin and executive can delete the patient
    @PutMapping("/api/v1/patient/{patientId}/delete")
    public void deletePatientInfo(@PathVariable Long  patientId,
                                   Principal principal){
        patientService.deletePatientInfo( patientId , principal.getName());

    }
    // used by patient itself
    @GetMapping("/api/v1/patient/profile")
    public PatientResDto fetchPatientProfile(Principal principal){
        return patientService.fetchPatientProfile(principal.getName());
    }

    // used by admin to manage patient
    @GetMapping("/api/v1/patients")
    public PatientViewDto fetchPatients(Principal principal,
                                        @RequestParam(name = "page", required = false, defaultValue = "0") Integer page,
                                        @RequestParam(name = "size" , required = false , defaultValue = "5") Integer size){
        return patientService.fetchPatients(principal.getName() , page ,size);

    }

    // to see  patient profile
    @GetMapping("/api/v1/patient/{patientId}")
    public PatientResDto fetchPatientById(@PathVariable Long patientId){
        return patientService.fetchPatientById(patientId);
    }

    @GetMapping("/api/v1/patient/dashboard/summary")
    public PatientDashboardSummaryDto fetchDashboardSummary(Principal principal) {

        return  patientService.fetchDashboardSummary(principal.getName());
    }

    // Admin patient report
    @GetMapping("/api/v1/patients/admin/report")
    public PatientReportDto getPatientReport(@RequestParam(name = "gender", required = false) Gender gender,
                                             @RequestParam(name = "fromDate", required = false) LocalDate fromDate,
                                             @RequestParam(name = "toDate", required = false) LocalDate toDate,
                                             @RequestParam(name = "page", required = false, defaultValue = "0") Integer page,
                                             @RequestParam(name = "size", required = false, defaultValue = "10") Integer size) {

        return patientService.getPatientReport(gender, fromDate, toDate, page, size);
    }



}
