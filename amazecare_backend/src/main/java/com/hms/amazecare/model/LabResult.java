package com.hms.amazecare.model;

import com.hms.amazecare.enums.LabTestStatus;
import com.hms.amazecare.enums.LabTestName;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "lab_result")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class LabResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "test_name", nullable = false, length = 50)
    private LabTestName testName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LabTestStatus testStatus = LabTestStatus.RECOMMENDED;

    private String resultValue;
    private String reportFilePath;
    private LocalDate resultDate;

    @ManyToOne
    @JoinColumn(name = "medical_record_id", nullable = false)
    private MedicalRecord medicalRecord;
}
