package com.hms.amazecare.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

public record AvailabilityDto(
        @NotNull(message = "DayOfWeek is required")
        DayOfWeek dayOfWeek,

        @NotNull(message = "startTime is required")
        @JsonFormat(pattern = "HH:mm")
        LocalTime startTime,

        @NotNull(message = "endTime is required")
        @JsonFormat(pattern = "HH:mm")
        LocalTime endTime,

        @NotNull(message = "slotDuration is required")
        Integer slotDuration
) {
}
