package com.hms.amazecare.controller;

import com.hms.amazecare.dto.request.SendMessageRequest;
import com.hms.amazecare.dto.response.ConversationAddResDto;
import com.hms.amazecare.dto.response.ConversationListResDto;
import com.hms.amazecare.dto.response.DoctorConversationResDto;
import com.hms.amazecare.dto.response.MessageResponse;
import com.hms.amazecare.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat.send")
    public MessageResponse sendMessage(@Payload SendMessageRequest request , Principal principal){
        return chatService.sendMessage(request , principal.getName());
    }

    @GetMapping("/api/chat/{conversationId}/messages")
    public List<MessageResponse> getChatMessages(
            @PathVariable Long conversationId,
            Principal principal) {
        return chatService.getChatMessages(conversationId, principal.getName());
    }
    @PostMapping("/api/chat/create/conversations")
    public ConversationAddResDto createConversation(@RequestParam Long doctorId, Principal principal) {

        return chatService.createConversation(doctorId, principal.getName());
    }

    @GetMapping("/api/chat/patient/conversations")
    public List<ConversationListResDto> getPatientConversations(Principal principal) {

        return chatService.getPatientConversations(principal.getName()
        );
    }
    @GetMapping("/api/chat/doctor/conversations")
    public List<DoctorConversationResDto> getDoctorConversations(Principal principal) {

        return chatService.getDoctorConversations(principal.getName());
    }
}
