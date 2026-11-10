package com.hms.amazecare.dto.response;

import java.time.LocalDateTime;

public record MessageResponse(
        Long id,
        Long conversationId,
        String senderUsername,
        String content,
        LocalDateTime sentAt
) {
}
