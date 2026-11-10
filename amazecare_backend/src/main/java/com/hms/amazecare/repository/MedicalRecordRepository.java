package com.hms.amazecare.repository;

import com.hms.amazecare.dto.response.DoctorConsultationResDto;
import com.hms.amazecare.model.MedicalRecord;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord , Long> {
    boolean existsByAppointmentId(Long appointmentId);

    @Query("""
            select m
            from MedicalRecord m
            join m.appointment a
            join a.patient p
            where p.user.email = ?1
            order by a.appointmentDate desc
            """)
    List<MedicalRecord> fetchMedicalRecordsByEmail(String userEmail);

    Optional<MedicalRecord> findByAppointmentId(Long appointmentId);

    @Query("""
        select mr
        from MedicalRecord mr
        join mr.appointment a
        where a.patient.id = ?1
        and a.doctor.user.email = ?2
        order by a.appointmentDate desc
        """)
    List<MedicalRecord> fetchMedicalRecordsByPatientAndDoctor(Long patientId, String userEmail);

}
