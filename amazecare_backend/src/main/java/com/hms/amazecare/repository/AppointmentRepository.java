package com.hms.amazecare.repository;

import com.hms.amazecare.dto.response.*;
import com.hms.amazecare.enums.AppointmentStatus;
import com.hms.amazecare.model.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment , Long> {

    @Query("""
            select a.id as appointmentId,d.id as DoctorId, d.firstName as doctorFirstName, d.lastName as doctorLastName, d.specialization,a.appointmentDate, a.appointmentTime,a.visitType,a.reason,a.status,a.createdAt
            from Appointment a
            left join a.doctor d
            join a.patient p
            join p.user u
            where u.email = ?1
            and (?2 is null or a.appointmentDate = ?2)
            and (?3 is null or a.status = ?3)
            and (?4 is null or a.appointmentDate >= ?4)
            and (?5 is null or a.appointmentDate <= ?5)
            order by a.appointmentDate desc ,a.appointmentTime desc
            """)
    Page<PatientAppointmentDto> getAppointmentByPatient(String patientUserName, LocalDate date, AppointmentStatus status, LocalDate fromDate, LocalDate toDate, Pageable pageable);


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
            order by a.appointmentDate asc ,a.appointmentTime asc
            """)
    Page<DoctorAppointmentDto> getAppointmentByDoctor(String doctorUserName, LocalDate date, AppointmentStatus status, LocalDate fromDate, LocalDate toDate, Pageable pageable);


    @Query("""
            select a.id as appointmentId,p.id as patientId, p.firstName as patientFirstName,p.lastName as patientLastName,p.phone as patientContact,d.id as doctorId,d.firstName as doctorFirstName,d.lastName as doctorLastName,a.appointmentDate, a.appointmentTime,a.visitType,a.reason,a.status,a.createdAt
            from Appointment a
            join a.patient p
            left join a.doctor d
            where (?1 is null or (?1 = true and a.doctor is not null) or (?1 = false and a.doctor is null))
            and (?2 is null or a.status = ?2)
            and (?3 is null or a.appointmentDate >= ?3)
            and (?4 is null or a.appointmentDate <= ?4)
            order by a.appointmentDate desc ,a.appointmentTime desc
            """)
    Page<ExecutiveAppointmentDto> getAppointmentsByExecutive(Boolean assigned, AppointmentStatus status, LocalDate fromDate, LocalDate toDate, Pageable pageable);


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


    @Query("""
            select a
            from Appointment a
            where (?1 is null or a.status = ?1)
            and (?2 is null or a.appointmentDate >= ?2)
            and (?3 is null or a.appointmentDate <= ?3)
            order by a.appointmentDate desc ,a.appointmentTime desc
            """)
    Page<Appointment> findAdminAppointments(AppointmentStatus status, LocalDate fromDate, LocalDate toDate, Pageable pageable);

    boolean existsByPatientIdAndDoctorIdAndStatus(Long id, Long doctorId, AppointmentStatus appointmentStatus);

    @Query("""
            select count(a)
            from Appointment a
            join a.patient p
            join p.user u
            where u.email = ?1
            and a.status = ?2
            and (a.appointmentDate > ?3 or (a.appointmentDate = ?3 and a.appointmentTime >= ?4))
            """)
    long countUpcomingAppointments(String userEmail, AppointmentStatus appointmentStatus, LocalDate today, LocalTime currentTime);


    @Query("""
        select count(a)
        from Appointment a
        join a.patient p
        join p.user u
        where u.email = ?1
        and a.status = ?2
        """)
    long countByPatientEmailAndStatus(String userEmail, AppointmentStatus appointmentStatus);


    @Query("""
        select count(a)
        from Appointment a
        where a.doctor is null
        and a.status = ?1
        """)
    long countPendingExecutiveRequests(AppointmentStatus status);

    @Query("""
        select count(a)
        from Appointment a
        where a.appointmentDate = ?1
        """)
    long countExecutiveTodayAppointments(LocalDate today);

    @Query("""
        select count(a)
        from Appointment a
        where a.status = ?1
        """)
    long countExecutiveAppointmentsByStatus(AppointmentStatus status);


    @Query("""
        select a.id as appointmentId,a.appointmentDate,a.appointmentTime,a.visitType, a.reason, a.status, p.id as patientId,
            concat(p.firstName, ' ', p.lastName) as patientName,p.phone as patientPhone, d.id as doctorId, concat(d.firstName, ' ', d.lastName) as doctorName, d.specialization as doctorSpecialization
        from Appointment a
        join a.patient p
        left join a.doctor d
        where (?1 is null or a.status = ?1)
        and (?2 is null or a.appointmentDate >= ?2)
        and (?3 is null or a.appointmentDate <= ?3)
        and ( ?4 is null or d.id = ?4)
        order by a.appointmentDate desc, a.appointmentTime desc
        """)
    Page<AppointmentDetailsResDto> getAppointmentReport(AppointmentStatus status,LocalDate fromDate, LocalDate toDate,  Long doctorId, Pageable pageable);

    @Query("""
    select count(a)
    from Appointment a
    where a.appointmentDate = ?1
    """)
    Long countTodayAppointments(LocalDate today);

    @Query("""
    select count(a)
    from Appointment a
    where a.status = ?1
    """)
    Long countByStatus(AppointmentStatus appointmentStatus);

    @Query("""
    select a.status, count(a)
    from Appointment a
    group by a.status
    """)
    List<AppointmentStatusCountDto> getAppointmentStatusCounts();


    @Query("""
        select a.id as appointmentId, concat(p.firstName, ' ', p.lastName) as patientName, concat(d.firstName, ' ', d.lastName) as doctorName, a.appointmentTime, a.status
        from Appointment a
        join a.patient p
        left join a.doctor d
        where a.appointmentDate = ?1
        order by a.appointmentTime asc
        """)
    List<TodayAppointmentDto> getTodayAppointments(LocalDate today);

    @Query("""
        select count(a)
        from Appointment a
        where a.doctor.id = ?1
        and a.appointmentDate = ?2
        """)
    Long countByDoctorAndAppointmentDate(Long doctorId, LocalDate today);

    @Query("""
        select count(a)
        from Appointment a
        where a.doctor.id = ?1
        and a.appointmentDate = ?2
        and a.status = ?3
        """)
    Long countByDoctorAndAppointmentDateAndStatus(Long doctorId, LocalDate today, AppointmentStatus appointmentStatus);

    @Query("""
        select count(a)
        from Appointment a
        where a.doctor.id = ?1
        and a.appointmentDate = ?2
        and a.status in ?3
        """)
    Long countByDoctorAndAppointmentDateAndStatusIn(Long doctorId, LocalDate today, List<AppointmentStatus> requested);

    @Query("""
    select a.id as appointmentId, a.appointmentDate,a.appointmentTime, a.visitType, a.reason,a.status,
        p.id as patientId,concat(p.firstName, ' ', p.lastName) as patientName, p.phone as patientPhone, 
        d.id as doctorId, concat(d.firstName, ' ', d.lastName) as doctorName, d.specialization as doctorSpecialization
    from Appointment a
    join a.patient p
    join a.doctor d
    where d.id = ?1
    and a.appointmentDate = ?2
    order by a.appointmentTime asc
    """)
    List<AppointmentDetailsResDto> fetchTodayAppointments(Long doctorId, LocalDate today);
}





