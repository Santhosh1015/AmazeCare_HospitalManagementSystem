package com.hms.amazecare.repository;

import com.hms.amazecare.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    @Query("""
            select p
            from Patient p
            join p.user u
            where u.email = ?1
            """)
    Patient getPatientByUsername(String patientUserName);
}
