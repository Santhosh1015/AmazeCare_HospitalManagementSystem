package com.hms.amazecare.repository;

import com.hms.amazecare.dto.response.ExecutiveResDto;
import com.hms.amazecare.enums.ExecutiveDesignation;
import com.hms.amazecare.model.Executive;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface ExecutiveRepository extends JpaRepository<Executive , Long> {


    Executive findByUserEmail(String executiveEmail);

    @Query("""
        select concat(e.firstName, ' ', e.lastName), e.employeeId, e.designation 
        from Executive e
        join e.user u
        where u.status = 'ACTIVE'
        and (?1 is null or e.designation = ?1)
        and (?2 is null or e.createdAt >= ?2)
        and (?3 is null or e.createdAt <= ?3)
         order by e.createdAt desc
        """)
    Page<ExecutiveResDto> getExecutiveReport(ExecutiveDesignation designation, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    @Query("""
        select e
        from Executive e
        join e.user u
        where u.status = 'ACTIVE'
        """)
    Page<Executive> findAllActiveExecutives(Pageable pageable);
}
