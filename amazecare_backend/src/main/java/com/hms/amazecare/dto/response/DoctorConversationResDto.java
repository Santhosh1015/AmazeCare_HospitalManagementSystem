package com.hms.amazecare.dto.response;

import java.time.LocalDateTime;

public record DoctorConversationResDto(
        Long conversationId,
        Long patientId,
        String patientName,
        LocalDateTime lastMessageAt
) {
}
