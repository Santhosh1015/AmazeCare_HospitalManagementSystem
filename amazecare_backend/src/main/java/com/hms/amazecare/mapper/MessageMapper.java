package com.hms.amazecare.mapper;

import com.hms.amazecare.dto.response.MessageResponse;
import com.hms.amazecare.model.Message;
import org.springframework.stereotype.Component;

@Component
public class MessageMapper {
    public static MessageResponse createMessageResponse(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getConversation().getId(),
                message.getSender().getEmail(),
                message.getContent(),
                message.getSentAt()
        );
    }
}
