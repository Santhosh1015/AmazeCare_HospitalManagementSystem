package com.hms.amazecare.controller;

import com.hms.amazecare.dto.response.DoctorConsultationResDto;
import com.hms.amazecare.dto.response.MedicalRecordResDto;
import com.hms.amazecare.dto.response.PatientMedicalHistoryDto;
import com.hms.amazecare.service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class MedicalRecordController {
    private final MedicalRecordService medicalRecordService;

    @GetMapping("/api/v1/medical-record/{recordId}")
    public MedicalRecordResDto fetchMedicalRecord(@PathVariable Long recordId,
                                                  Principal principal){
        return medicalRecordService.fetchMedicalRecord(recordId, principal.getName());
    }

    @GetMapping("/api/v1/patient/medical-records")
    public List<PatientMedicalHistoryDto> fetchMyMedicalHistory(Principal principal) {
        return medicalRecordService.fetchPatientMedicalHistory(principal.getName());
    }
    @GetMapping("/api/v1/doctor/patients/{patientId}/medical-records")
    public List<DoctorConsultationResDto> getPatientMedicalHistory(@PathVariable Long patientId, Principal principal) {

        return medicalRecordService.getPatientMedicalHistory(patientId, principal.getName());
    }

}
