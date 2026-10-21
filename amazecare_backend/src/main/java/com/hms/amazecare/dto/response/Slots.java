package com.hms.amazecare.dto.response;

import java.time.LocalTime;

public record Slots(
        LocalTime slotTime,
        Boolean available
) {
}
