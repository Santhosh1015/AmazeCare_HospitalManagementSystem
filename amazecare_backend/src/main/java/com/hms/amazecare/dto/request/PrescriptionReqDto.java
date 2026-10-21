package com.hms.amazecare.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record PrescriptionReqDto(
        @NotNull(message = "Prescribed Date is required.")
        LocalDate prescribedDate,
        String instructions,
        @NotEmpty(message = "PrescribedItems is required")

        @NotEmpty(message = "prescriptionItem is required")
        @Valid List<PrescribedItemsReqDto> prescribedItems
) {
}
