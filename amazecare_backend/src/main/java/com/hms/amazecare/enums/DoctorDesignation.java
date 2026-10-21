package com.hms.amazecare.enums;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

public enum DoctorDesignation {
    JUNIOR_DOCTOR,
    RESIDENT_DOCTOR,
    GENERAL_PRACTITIONER,
    CONSULTANT,
    SENIOR_CONSULTANT,
    CHIEF_MEDICAL_OFFICER,
    HEAD_OF_DEPARTMENT
}
