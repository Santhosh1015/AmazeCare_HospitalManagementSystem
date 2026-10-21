package com.hms.amazecare.repository;

import com.hms.amazecare.dto.response.DoctorAppointmentDto;
import com.hms.amazecare.dto.response.ExecutiveAppointmentDto;
import com.hms.amazecare.dto.response.PatientAppointmentDto;
import com.hms.amazecare.enums.AppointmentStatus;
import com.hms.amazecare.model.Appointment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment , Long> {

    @Query("""
            select a.id as appointmentId,d.firstName as doctorFirstName, d.lastName as doctorLastName, d.specialization,a.appointmentDate, a.appointmentTime,a.visitType,a.reason,a.status,a.createdAt
            from Appointment a
            left join a.doctor d
            join a.patient p
            join p.user u
            where u.email = ?1
            and (?2 is null or a.appointmentDate = ?2)
            and (?3 is null or a.status = ?3)
            and (?4 is null or a.appointmentDate >= ?4)
            and (?5 is null or a.appointmentDate <= ?5)
            """)
    List<PatientAppointmentDto> getAppointmentByPatient(String patientUserName, LocalDate date, AppointmentStatus status, LocalDate fromDate, LocalDate toDate, Pageable pageable);


    @Query("""
            select a.id as appointmentId,p.id as patientId, p.firstName as patientFirstName,p.lastName as patientLastName,p.phone as patientContact,a.appointmentDate, a.appointmentTime,a.visitType,a.reason,a.status,a.createdAt
            from Appointment a
            join a.doctor d
            join a.patient p
            join d.user u
            where u.email = ?1
            and (?2 is null or a.appointmentDate = ?2)
            and (?3 is null or a.status = ?3)
            and (?4 is null or a.appointmentDate >= ?4)
            and (?5 is null or a.appointmentDate <= ?5)
            """)
    List<DoctorAppointmentDto> getAppointmentByDoctor(String doctorUserName, LocalDate date, AppointmentStatus status, LocalDate fromDate, LocalDate toDate, Pageable pageable);


    @Query("""
            select a.id as appointmentId,p.id as patientId, p.firstName as patientFirstName,p.lastName as patientLastName,p.phone as patientContact,d.id as doctorId,d.firstName as doctorFirstName,d.lastName as doctorLastName,a.appointmentDate, a.appointmentTime,a.visitType,a.reason,a.status,a.createdAt
            from Appointment a
            join a.patient p
            left join a.doctor d
            where (?1 is null or (?1 = true and a.doctor is not null) or (?1 = false and a.doctor is null))
            and (?2 is null or a.appointmentDate = ?2)
            and (?3 is null or a.status = ?3)
            and (?4 is null or a.appointmentDate >= ?4)
            and (?5 is null or a.appointmentDate <= ?5)
            """)
    List<ExecutiveAppointmentDto> getAppointmentsByExecutive( Boolean assigned, AppointmentStatus status, LocalDate fromDate, LocalDate toDate);


    @Query("""
            select a
            from Appointment a
            where a.doctor.id = ?1
            and a.appointmentDate = ?2
            and a.status <> AppointmentStatus.CANCELLED
            """)
    List<Appointment> getBookedAppointmentTiming(Long doctorId, LocalDate date);

    @Modifying
    @Query("""
       update Appointment a
       set a.status = ?2, a.cancelReason = ?3, a.updatedAt = ?5
       where a.status = ?1 and a.appointmentDate < ?4
       """)
    int closeOverdue(AppointmentStatus oldStatus, AppointmentStatus newStatus, String reason, LocalDate today, LocalDateTime now);
}
