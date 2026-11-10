package com.hms.amazecare.mapper;

import com.hms.amazecare.dto.response.*;
import com.hms.amazecare.model.Appointment;
import com.hms.amazecare.model.LabResult;
import com.hms.amazecare.model.MedicalRecord;

import java.util.List;

public class MedicalRecordMapper {
    public static MedicalRecordResDto createResponseDto(MedicalRecord record) {
        return  new MedicalRecordResDto(
                record.getId(),
                record.getAppointment().getId(),
                record.getAppointment().getPatient().getFirstName() +" "+record.getAppointment().getPatient().getLastName(),
                record.getAppointment().getDoctor().getFirstName() +" "+record.getAppointment().getDoctor().getLastName(),
                record.getSymptoms(),
                record.getPhysicalExamination(),
                record.getDiagnosis(),
                record.getTreatmentPlan(),
                record.getCreatedAt()
        );
    }

    public static PatientMedicalHistoryDto createPatientHistory(MedicalRecord record,
                                                                List<LabResultsDto> labsResultList,
                                                                PrescriptionResDto prescriptionResDto) {
        return  new PatientMedicalHistoryDto(
                record.getId(),
                record.getAppointment().getId(),
                record.getAppointment().getAppointmentDate(),
                record.getAppointment().getDoctor().getFirstName() +" "+record.getAppointment().getDoctor().getLastName(),
                record.getSymptoms(),
                record.getPhysicalExamination(),
                record.getDiagnosis(),
                record.getTreatmentPlan(),
                labsResultList,
                prescriptionResDto
        );
    }

    public static DoctorConsultationResDto createDoctorConsultation(Appointment appointment, MedicalRecord record, PrescriptionResDto prescriptionDto, List<LabResultsDto> labResults) {
        return new DoctorConsultationResDto(
                appointment.getId(),
                record.getId(),
                appointment.getPatient().getFirstName()+" "+appointment.getPatient().getLastName(),
                appointment.getAppointmentDate(),
                record.getSymptoms(),
                record.getPhysicalExamination(),
                record.getDiagnosis(),
                record.getTreatmentPlan(),
                prescriptionDto,
                labResults


        );
    }
}
