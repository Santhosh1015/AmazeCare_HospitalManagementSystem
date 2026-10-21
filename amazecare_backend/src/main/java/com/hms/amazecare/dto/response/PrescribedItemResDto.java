package com.hms.amazecare.dto.response;

import com.hms.amazecare.enums.FoodTiming;
import com.hms.amazecare.enums.Frequency;

public record PrescribedItemResDto(
        String medicineName,
        String dosage,
        String frequency,
        FoodTiming foodTiming,
        int durationDays,
        String Instructions
) {
}
