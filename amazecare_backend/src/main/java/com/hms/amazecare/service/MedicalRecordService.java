package com.hms.amazecare.service;

import com.hms.amazecare.dto.response.MedicalRecordResDto;
import com.hms.amazecare.enums.Role;
import com.hms.amazecare.enums.UserStatus;
import com.hms.amazecare.exception.AccessDeniedException;
import com.hms.amazecare.exception.ResourceNotFoundException;
import com.hms.amazecare.mapper.MedicalRecordMapper;
import com.hms.amazecare.model.MedicalRecord;
import com.hms.amazecare.model.User;
import com.hms.amazecare.repository.MedicalRecordRepository;
import com.hms.amazecare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;

    public MedicalRecordResDto fetchMedicalRecord(Long recordId, String userEmail) {

        //check medical record
        MedicalRecord medicalRecord = medicalRecordRepository.findById(recordId)
                .orElseThrow(()-> new ResourceNotFoundException("Invalid Medical Record Id"));
        // check user
        User user = userRepository.findByEmail(userEmail);

        // check user is authorized for this op
        Role userRole = user.getRole();
        switch (userRole){
            case PATIENT->{
                if(!user.getId().equals(medicalRecord.getPatient().getUser().getId())){
                    throw new AccessDeniedException("Patient can only access their Records");
                }
            }
            case DOCTOR ->{
                if(!user.getId().equals(medicalRecord.getDoctor().getUser().getId())){
                    throw new AccessDeniedException("Doctor can only see their prepared Records");
                }
            }case ADMIN, EXECUTIVE -> {}
            default -> throw new AccessDeniedException("Access Denied");
        }

        return MedicalRecordMapper.createResponseDto(medicalRecord);
    }
}
