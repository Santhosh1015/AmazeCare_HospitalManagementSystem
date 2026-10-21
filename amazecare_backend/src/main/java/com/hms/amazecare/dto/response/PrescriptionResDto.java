package com.hms.amazecare.dto.response;

import java.util.List;

public record PrescriptionResDto(
        Long prescriptionId,
        String instructions,
        List<PrescribedItemResDto> prescribedItemResDto
) {
}
