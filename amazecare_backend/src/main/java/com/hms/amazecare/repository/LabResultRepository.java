package com.hms.amazecare.repository;

import com.hms.amazecare.dto.response.LabResultsDto;
import com.hms.amazecare.enums.LabTestName;
import com.hms.amazecare.enums.LabTestStatus;
import com.hms.amazecare.model.LabResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface LabResultRepository extends JpaRepository<LabResult, Long> {

    @Query("""
            select l.id, l.testName,l.testStatus,l.resultValue,l.resultDate
            from LabResult l
            where l.medicalRecord.id = ?1
            and (?2 is null or l.testName =?2)
            and (?3 is null or l.testStatus = ?3)
            """)
    List<LabResultsDto> getLabResultsByMedicalRecordId(Long recordId,
                                                       LabTestName testName,
                                                       LabTestStatus status);
}
