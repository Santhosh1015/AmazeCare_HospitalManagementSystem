package com.hms.amazecare.mapper;

import com.hms.amazecare.dto.request.AppointmentDto;
import com.hms.amazecare.dto.request.AppointmentReqDto;
import com.hms.amazecare.dto.request.ConsultationRequestDto;
import com.hms.amazecare.dto.response.AppointmentDetailsResDto;
import com.hms.amazecare.dto.response.BookingRespDto;
import com.hms.amazecare.model.Appointment;
import com.hms.amazecare.model.Doctor;
import com.hms.amazecare.model.MedicalRecord;
import com.hms.amazecare.model.Patient;
import jakarta.validation.Valid;
import org.springframework.stereotype.Component;

import javax.print.Doc;

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
                doctor != null ? doctor.getId() : null,
                doctor != null ? doctor.getFirstName() : null,
                doctor != null ? doctor.getLastName() : null,
                doctor != null ? doctor.getSpecialization() : null,
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

    public static AppointmentDetailsResDto createAppointmentDetails(Appointment appointment) {
        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();
        return new AppointmentDetailsResDto(
                appointment.getId(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime(),
                appointment.getVisitType(),
                appointment.getReason(),
                appointment.getStatus(),

                patient.getId(),
                patient.getFirstName() + " " + patient.getLastName(),
                patient.getPhone(),

                doctor != null ? doctor.getId() : null,
                doctor != null ? doctor.getFirstName() + " " + doctor.getLastName() : null,
                doctor != null ? doctor.getSpecialization() : null

        );
    }

    public static Appointment convertAppointmentReqDto(@Valid AppointmentReqDto appointmentReqDto) {
        Appointment appointment = new Appointment();
        appointment.setAppointmentDate(appointmentReqDto.appointmentDate());
        appointment.setReason(appointmentReqDto.reason());
        appointment.setVisitType(appointmentReqDto.visitType());
        return  appointment;
    }
}
