package com.hms.amazecare.repository;

import com.hms.amazecare.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord , Long> {
    boolean existsByAppointmentId(Long appointmentId);
}
