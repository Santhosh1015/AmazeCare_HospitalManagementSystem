package com.hms.amazecare.dto.response;

import java.time.LocalDate;
import java.util.List;

public record SlotsDto(
        Long doctorId,
        LocalDate date,
        List<Slots> availableSlots
) {
}
