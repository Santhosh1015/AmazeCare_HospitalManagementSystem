package com.hms.amazecare.mapper;

import com.hms.amazecare.dto.request.AppointmentDto;
import com.hms.amazecare.dto.request.ConsultationRequestDto;
import com.hms.amazecare.dto.response.BookingRespDto;
import com.hms.amazecare.model.Appointment;
import com.hms.amazecare.model.Doctor;
import com.hms.amazecare.model.MedicalRecord;
import jakarta.validation.Valid;
import org.springframework.stereotype.Component;

@Component
public class AppointmentMapper {
    public static Appointment convertDtoIntoEntity(AppointmentDto appointmentDto) {
        Appointment appointment = new Appointment();

        appointment.setAppointmentDate(appointmentDto.appointmentDate());
        appointment.setAppointmentTime(appointmentDto.appointmentTime());
        appointment.setReason(appointmentDto.reason());
        appointment.setVisitType(appointmentDto.visitType());
        return appointment;
    }

    public static BookingRespDto createBookingRespDto(Appointment saved , Doctor doctor) {
        return new BookingRespDto(
                saved.getId(),
                doctor.getFirstName(),
                doctor.getLastName(),
                doctor.getSpecialization(),
                saved.getAppointmentDate(),
                saved.getAppointmentTime(),
                saved.getStatus()
        );
    }

    public static MedicalRecord createMedicalRecord(@Valid ConsultationRequestDto dto) {
        MedicalRecord medicalRecord = new MedicalRecord();
        medicalRecord.setSymptoms(dto.symptoms());
        medicalRecord.setDiagnosis(dto.diagnosis());
        medicalRecord.setPhysicalExamination(dto.physicalExamination());

        medicalRecord.setTreatmentPlan(dto.treatmentPlan());

        return medicalRecord;
    }
}
