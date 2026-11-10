package com.hms.amazecare.mapper;

import com.hms.amazecare.dto.response.*;
import com.hms.amazecare.model.*;

import javax.print.Doc;
import java.util.List;

public class ConsultationMapper {
    public static ConsultationResDto createConsultationResDto(Appointment appointment,
                                                              MedicalRecord medicalRecord,
                                                              List<LabResult> labResults,
                                                              Prescription prescription,
                                                              List<PrescriptionItem> prescribedItems) {

        List<LabTestsResDto> labsResultList = labResults.stream()
                .map( list -> new LabTestsResDto( list.getTestName(), list.getTestStatus()))
                .toList();

        PrescriptionResDto prescriptionResDto = prescription == null ? null:
                new PrescriptionResDto(
                        prescription.getId(),
                        prescription.getInstructions(),
                        prescribedItems.stream().map(ConsultationMapper::convertPrescribedItemToDto).toList());

        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();

        return new ConsultationResDto(
                appointment.getId(),
                appointment.getStatus(),
                medicalRecord.getId(),
                patient.getFirstName()+" "+patient.getLastName(),
                doctor.getFirstName() +" "+ doctor.getLastName(),
                appointment.getAppointmentDate(),
                medicalRecord.getDiagnosis(),
                labsResultList,
                prescriptionResDto
        );

    }

    public static PrescribedItemResDto convertPrescribedItemToDto(PrescriptionItem item) {
        return new PrescribedItemResDto(
                item.getMedicineName(),
                item.getDosage(),
                item.getFrequency().getLabel(),
                item.getFoodTiming(),
                item.getDurationDays(),
                item.getInstructions());
    }
    public static DoctorConsultationResDto createDoctorConsultationResDto(
            Appointment appointment,
            MedicalRecord medicalRecord,
            Prescription prescription,
            List<PrescriptionItem> prescribedItems,
            List<LabResult> labResults) {

        Patient patient = appointment.getPatient();

        PrescriptionResDto prescriptionResDto = prescription == null ? null :
                new PrescriptionResDto(
                        prescription.getId(),
                        prescription.getInstructions(),
                        prescribedItems.stream()
                                .map(ConsultationMapper::convertPrescribedItemToDto)
                                .toList()
                );

        List<LabResultsDto> labsResultList = labResults.stream()
                .map(list -> new LabResultsDto(
                        list.getId(),
                        list.getTestName(),
                        list.getTestStatus(),
                        list.getResultValue(),
                        list.getResultDate()
                ))
                .toList();

        return new DoctorConsultationResDto(
                appointment.getId(),
                medicalRecord.getId(),
                patient.getFirstName() + " " + patient.getLastName(),
                appointment.getAppointmentDate(),
                medicalRecord.getSymptoms(),
                medicalRecord.getPhysicalExamination(),
                medicalRecord.getDiagnosis(),
                medicalRecord.getTreatmentPlan(),
                prescriptionResDto,
                labsResultList
        );
    }
}
