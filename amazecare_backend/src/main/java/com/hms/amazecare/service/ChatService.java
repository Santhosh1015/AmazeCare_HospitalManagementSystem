package com.hms.amazecare.service;

import com.hms.amazecare.dto.response.ConversationAddResDto;
import com.hms.amazecare.dto.request.SendMessageRequest;
import com.hms.amazecare.dto.response.ConversationListResDto;
import com.hms.amazecare.dto.response.DoctorConversationResDto;
import com.hms.amazecare.dto.response.MessageResponse;
import com.hms.amazecare.enums.AppointmentStatus;
import com.hms.amazecare.exception.AccessDeniedException;
import com.hms.amazecare.exception.ResourceNotFoundException;
import com.hms.amazecare.mapper.MessageMapper;
import com.hms.amazecare.model.Conversation;
import com.hms.amazecare.model.Doctor;
import com.hms.amazecare.model.Message;
import com.hms.amazecare.model.Patient;
import com.hms.amazecare.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private  final AppointmentRepository appointmentRepository;

    public MessageResponse sendMessage(SendMessageRequest request, String senderEmail) {
        Conversation conversation = conversationRepository.findById(request.conversationId())
                .orElseThrow(() ->new ResourceNotFoundException("Conversation not found"));

        boolean isPatient = conversation.getPatient().getUser().getEmail().equals(senderEmail);
        boolean isDoctor = conversation.getDoctor().getUser().getEmail().equals(senderEmail);

        if (!isPatient && !isDoctor) {
            throw new AccessDeniedException("You are not a participant in this conversation");
        }

        Message message = new Message();
        message.setContent(request.content());
        message.setConversation(conversation);
        message.setSender(isPatient  ?
                            conversation.getPatient().getUser()
                            :
                            conversation.getDoctor().getUser() );

        Message savedMessage = messageRepository.save(message);

        conversation.setLastMessageAt(message.getSentAt());
        conversationRepository.save(conversation);

        MessageResponse response = MessageMapper.createMessageResponse(savedMessage);

        String recipientUsername = isPatient
                ? conversation.getDoctor().getUser().getEmail()
                : conversation.getPatient().getUser().getEmail();

        messagingTemplate.convertAndSendToUser(
                recipientUsername,
                "/queue/messages",
                response
        );

        // 8. Return saved message to sender
        return response;
    }

    public List<MessageResponse> getChatMessages(Long conversationId, String userEmail) {
        //  Find the conversation
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        //  Validate whether the user is a participant
        boolean isPatient = conversation.getPatient().getUser().getEmail().equals(userEmail);

        boolean isDoctor = conversation.getDoctor().getUser().getEmail().equals(userEmail);

        if (!isPatient && !isDoctor) {
            throw new AccessDeniedException("You are not authorized to access this conversation");
        }

       // Retrieve messages in chronological order
        List<Message> messages = messageRepository.findByConversationIdOrderBySentAtAsc(conversationId);

        //  Convert Message entities into response DTOs
        return messages
                .stream()
                .map(MessageMapper::createMessageResponse)
                .toList();
    }

    @Transactional
    public ConversationAddResDto createConversation(Long doctorId, String patientEmail) {

        // Get the logged-in patient
        Patient patient = patientRepository.findByUserEmail(patientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        // Check whether an appointment exists with this doctor
        boolean appointmentExists = appointmentRepository.existsByPatientIdAndDoctorIdAndStatus(patient.getId(), doctorId, AppointmentStatus.COMPLETED);

        if (!appointmentExists) {
            throw new ResourceNotFoundException("Chat is available only for patients with a completed appointment"
            );
        }

        // 3. Check whether a conversation already exists
        Conversation existingConversation = conversationRepository.findByPatientIdAndDoctorId(patient.getId(), doctorId)
                .orElse(null);

        if (existingConversation != null) {
            return new ConversationAddResDto(existingConversation.getId());
        }

        // 4. Get the selected doctor
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        // 5. Create a new conversation
        Conversation conversation = new Conversation();

        conversation.setPatient(patient);
        conversation.setDoctor(doctor);
        conversation.setLastMessageAt(LocalDateTime.now());


        Conversation savedConversation = conversationRepository.save(conversation);

        return new ConversationAddResDto(savedConversation.getId());
    }

    public List<ConversationListResDto> getPatientConversations(String patientEmail) {
        Patient patient = patientRepository.findByUserEmail(patientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        List<Conversation> conversations = conversationRepository.findByPatientIdOrderByLastMessageAtDesc(patient.getId());

        return conversations.stream()
                .map(conversation -> new ConversationListResDto(
                        conversation.getId(),
                        conversation.getDoctor().getId(),
                        conversation.getDoctor().getFirstName() + " " +
                                conversation.getDoctor().getLastName(),
                        conversation.getDoctor().getSpecialization().toString(),
                        conversation.getLastMessageAt()
                ))
                .toList();
    }

    public List<DoctorConversationResDto> getDoctorConversations(String doctorEmail) {

        Doctor doctor = doctorRepository.findByUserEmail(doctorEmail);
        if(doctor == null )
               throw new ResourceNotFoundException("Doctor not found");

        return conversationRepository
                .findByDoctorIdOrderByLastMessageAtDesc(doctor.getId())
                .stream()
                .map(conversation -> new DoctorConversationResDto(
                        conversation.getId(),
                        conversation.getPatient().getId(),
                        conversation.getPatient().getFirstName() + " " +
                                conversation.getPatient().getLastName(),
                        conversation.getLastMessageAt()
                ))
                .toList();
    }
}
