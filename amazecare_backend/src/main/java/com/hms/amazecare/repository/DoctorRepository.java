package com.hms.amazecare.repository;

import com.hms.amazecare.dto.response.DoctorProfileResDto;
import com.hms.amazecare.enums.Specialization;
import com.hms.amazecare.model.Doctor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    @Query("""
            select d.id as doctorId,d.firstName,d.lastName,d.specialization,d.qualification,d.designation,d.experienceYears
            from Doctor d
            join d.user u
            where u.status = 'ACTIVE'
            and (?1 is null or d.specialization = ?1)
            """)
    List<DoctorProfileResDto> viewDoctors(Specialization specialization, Pageable pageable);
}
