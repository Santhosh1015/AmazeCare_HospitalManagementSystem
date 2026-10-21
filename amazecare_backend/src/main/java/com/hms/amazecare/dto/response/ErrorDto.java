package com.hms.amazecare.dto.response;

import java.time.LocalDateTime;

public record ErrorDto(
        String message,
        String comments,
        LocalDateTime timeStamp
) {
}
