package com.hms.amazecare.repository;

import com.hms.amazecare.dto.response.RecentPatientDto;
import com.hms.amazecare.enums.Gender;
import com.hms.amazecare.model.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Patient findByUserId(Long id);


    @Query("""
            select distinct a.patient
            from Appointment a
            where a.doctor.id = ?1
            """)
    Page <Patient> fetchPatientsByDoctor(Long id, Pageable pageable);

    Optional<Patient> findByUserEmail(String patientEmail);

    @Query("""
        select p
        from Patient p
        join p.user u
        where u.status = com.hms.amazecare.enums.UserStatus.ACTIVE
        and (?1 is null or p.gender = ?1)
        and (?2 is null or p.createdAt >= ?2)
        and (?3 is null or p.createdAt <= ?3)
        order by p.createdAt desc
        """)
    Page<Patient> getPatientReport(Gender gender, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    @Query("""
        select count(p)
        from Patient p
        join p.user u
        where u.status = com.hms.amazecare.enums.UserStatus.ACTIVE
        """)
    Long countActivePatients();

    @Query("""
        select p.id as patientId , p.firstName, p.lastName, p.phone, cast(p.createdAt as LocalDate) as registeredOn
        from Patient p
        join p.user u
        where u.status = com.hms.amazecare.enums.UserStatus.ACTIVE
        order by p.createdAt desc
        """)
    List<RecentPatientDto> getRecentPatients();

    @Query("""
        select count(distinct a.patient.id)
        from Appointment a
        where a.doctor.id = ?1
        """)
    Long countPatientsByDoctor(Long doctorId);
}
