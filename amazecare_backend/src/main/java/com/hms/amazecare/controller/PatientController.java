package com.hms.amazecare.controller;

import com.hms.amazecare.dto.request.PatientDto;
import com.hms.amazecare.dto.request.PatientUpdateDto;
import com.hms.amazecare.dto.response.PatientResDto;
import com.hms.amazecare.model.Patient;
import com.hms.amazecare.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
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


}
