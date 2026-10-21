package com.hms.amazecare.mapper;

import com.hms.amazecare.dto.response.MedicalRecordResDto;
import com.hms.amazecare.model.MedicalRecord;

public class MedicalRecordMapper {
    public static MedicalRecordResDto createResponseDto(MedicalRecord record) {
        return  new MedicalRecordResDto(
                record.getId(),
                record.getAppointment().getId(),
                record.getPatient().getFirstName() +" "+record.getPatient().getLastName(),
                record.getDoctor().getFirstName() +" "+record.getDoctor().getLastName(),
                record.getSymptoms(),
                record.getPhysicalExamination(),
                record.getDiagnosis(),
                record.getTreatmentPlan(),
                record.getCreatedAt()
        );
    }
}
