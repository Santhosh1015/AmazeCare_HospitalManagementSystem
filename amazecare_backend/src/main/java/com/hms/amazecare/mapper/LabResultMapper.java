package com.hms.amazecare.mapper;

import com.hms.amazecare.dto.response.LabResultsDto;
import com.hms.amazecare.enums.LabTestStatus;
import com.hms.amazecare.enums.LabTestName;
import com.hms.amazecare.model.LabResult;
import com.hms.amazecare.model.MedicalRecord;

public class LabResultMapper {
    public static LabResult createLabResult(LabTestName testType, LabTestStatus labTestStatus, MedicalRecord medicalRecord) {
        LabResult labResult = new LabResult();
        labResult.setTestName(testType);
        labResult.setTestStatus(labTestStatus);
        labResult.setMedicalRecord(medicalRecord);
        return labResult;
    }

    public static LabResultsDto createResponseDto(LabResult labResult) {
        return new LabResultsDto(
                labResult.getId(),
                labResult.getTestName(),
                labResult.getTestStatus(),
                labResult.getResultValue(),
                labResult.getResultDate()

        );
    }
}
