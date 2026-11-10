package com.hms.amazecare.repository;

import com.hms.amazecare.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;


public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByPatientIdAndDoctorId(Long id, Long doctorId);

    List<Conversation> findByPatientIdOrderByLastMessageAtDesc(Long id);

    List<Conversation> findByDoctorIdOrderByLastMessageAtDesc(Long id);
}
