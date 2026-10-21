package com.hms.amazecare.controller;

import com.hms.amazecare.dto.response.MedicalRecordResDto;
import com.hms.amazecare.service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
public class MedicalRecordController {
    private final MedicalRecordService medicalRecordService;

    @GetMapping("/api/v1/medical-record/{recordId}")
    public MedicalRecordResDto fetchMedicalRecord(@PathVariable Long recordId,
                                                  Principal principal){
        return medicalRecordService.fetchMedicalRecord(recordId, principal.getName());
    }
}
