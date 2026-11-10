package com.hms.amazecare.repository;

import com.hms.amazecare.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    @Query("""
            select p
            from Prescription p
            where p.medicalRecord.id = ?1
            """)
    Prescription fetchPrescriptionByRecordId(Long id);
}
