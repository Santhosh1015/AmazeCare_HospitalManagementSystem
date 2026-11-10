package com.hms.amazecare.repository;

import com.hms.amazecare.dto.response.DoctorProfileResDto;
import com.hms.amazecare.dto.response.DoctorSpecializationCountDto;
import com.hms.amazecare.enums.Specialization;
import com.hms.amazecare.model.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    @Query("""
            select d.id as doctorId,d.firstName,d.lastName,d.specialization,d.qualification,d.designation, d.licenseNumber,d.experienceYears
            from Doctor d
            join d.user u
            where u.status = 'ACTIVE'
            and (?1 is null or d.specialization = ?1)
            and (?2 is null or exists (select 1 from DoctorAvailability a where a.doctor = d and dayOfWeek = ?2))
        """)
    Page<DoctorProfileResDto> viewDoctors(Specialization specialization, DayOfWeek day, Pageable pageable);

    Doctor findByUserId(Long id);

    Doctor findByUserEmail(String userEmail);


    @Query("""
        select d.id as doctorId , d.firstName, d.lastName,d.specialization, d.qualification, d.designation, d.licenseNumber,d.experienceYears
        from Doctor d
        join d.user u
        where u.status = 'ACTIVE'
        and (?1 is null or d.specialization = ?1)
        and (?2 is null or d.createdAt >= ?2)
        and (?3 is null or d.createdAt <= ?3)
        order by d.createdAt desc
        """)
    Page<DoctorProfileResDto> getDoctorReport(Specialization specialization, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    @Query("""
        select count(d)
        from Doctor d
        join d.user u
        where u.status = com.hms.amazecare.enums.UserStatus.ACTIVE
        """)
    Long countActiveDoctors();


    @Query("""
        select d.specialization, count(d)
        from Doctor d
        join d.user u
        where u.status = com.hms.amazecare.enums.UserStatus.ACTIVE
        group by d.specialization
        order by count(d) desc
        """)
    List<DoctorSpecializationCountDto> getDoctorCountsBySpecialization();
}
