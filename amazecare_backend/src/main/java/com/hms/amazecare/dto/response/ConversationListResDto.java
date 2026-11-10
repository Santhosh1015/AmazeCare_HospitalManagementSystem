package com.hms.amazecare.dto.response;

import java.time.LocalDateTime;

public record ConversationListResDto(
        Long conversationId,
        Long doctorId,
        String doctorName,
        String specialization,
        LocalDateTime lastMessageAt
) {
}
