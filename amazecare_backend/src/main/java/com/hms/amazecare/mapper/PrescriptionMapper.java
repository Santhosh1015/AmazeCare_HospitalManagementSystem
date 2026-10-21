package com.hms.amazecare.mapper;

import com.hms.amazecare.dto.request.PrescriptionReqDto;
import com.hms.amazecare.model.MedicalRecord;
import com.hms.amazecare.model.Prescription;
import jakarta.validation.Valid;

public class PrescriptionMapper {
    public static Prescription createPrescription(@Valid PrescriptionReqDto prescriptionReqDto, MedicalRecord medicalRecord) {
        Prescription prescription = new Prescription();
        prescription.setPrescribedDate(prescriptionReqDto.prescribedDate());
        prescription.setInstructions(prescriptionReqDto.instructions());
        prescription.setMedicalRecord(medicalRecord);
        return prescription;
    }
}
