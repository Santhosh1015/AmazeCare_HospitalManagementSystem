package com.hms.amazecare.dto.request;

import com.hms.amazecare.enums.FoodTiming;
import com.hms.amazecare.enums.Frequency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PrescribedItemsReqDto(
        @NotBlank(message = "MedicineName is required")
        String medicineName,
        @NotBlank(message = "Dosage is required")
        String dosage,
        @NotNull(message = "Frequency is required")
        Frequency frequency,
        @NotNull(message = "FoodTiming is required")
        FoodTiming foodTiming,
        @Positive
        int durationDays,
        String Instructions
) {
}
