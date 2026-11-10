package com.hms.amazecare.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SendMessageRequest(
        @NotNull(message = "ConversationId is required")
        Long conversationId,

        @NotBlank(message = "content is required")
        @Size(max = 5000)
        String content
) {
}
