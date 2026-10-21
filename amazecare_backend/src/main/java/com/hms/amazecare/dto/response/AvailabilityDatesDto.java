package com.hms.amazecare.dto.response;

import java.time.LocalDate;
import java.util.List;

public record AvailabilityDatesDto(
        Long doctorId,
        List<LocalDate> availableDates
){
}
