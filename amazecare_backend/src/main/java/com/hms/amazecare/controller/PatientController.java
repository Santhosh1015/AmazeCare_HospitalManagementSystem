package com.hms.amazecare.controller;

import com.hms.amazecare.dto.request.PatientDto;
import com.hms.amazecare.model.Patient;
import com.hms.amazecare.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping("/api/v1/register/patient")
    public void registerPatient(@Valid @RequestBody PatientDto patientDto){
        patientService.registerPatient(patientDto);
    }

}
