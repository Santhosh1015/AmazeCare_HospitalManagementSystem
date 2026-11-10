package com.hms.amazecare.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
public class Conversation{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // moved forward on every new message; used to sort the conversation list
    @Column(name = "last_message_at", nullable = false)
    private LocalDateTime lastMessageAt;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @PrePersist
    protected void onCreate() {

        createdAt = LocalDateTime.now();
    }
    @PreUpdate
    protected void onUpdate() {
        lastMessageAt = LocalDateTime.now();
    }

}

