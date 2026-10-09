package com.hms.amazecare.model;

import com.hms.amazecare.enums.FoodTiming;
import com.hms.amazecare.enums.Frequency;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "prescription_item")
public class PrescriptionItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private String dosage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Frequency frequency;

    @Enumerated(EnumType.STRING)
    @Column(name = "food_timing", nullable = false, length = 5)
    private FoodTiming foodTiming;

    @Column(name = "duration_days")
    private int durationDays;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @ManyToOne
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

}
