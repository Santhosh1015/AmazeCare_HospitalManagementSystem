package com.hms.amazecare.service;

import com.hms.amazecare.dto.request.LabResultUpdateDto;
import com.hms.amazecare.dto.response.LabResultsDto;
import com.hms.amazecare.enums.LabTestName;
import com.hms.amazecare.enums.LabTestStatus;
import com.hms.amazecare.enums.Role;
import com.hms.amazecare.enums.UserStatus;
import com.hms.amazecare.exception.AccessDeniedException;
import com.hms.amazecare.exception.ResourceNotFoundException;
import com.hms.amazecare.mapper.LabResultMapper;
import com.hms.amazecare.model.Executive;
import com.hms.amazecare.model.LabResult;
import com.hms.amazecare.model.MedicalRecord;
import com.hms.amazecare.model.User;
import com.hms.amazecare.repository.ExecutiveRepository;
import com.hms.amazecare.repository.LabResultRepository;
import com.hms.amazecare.repository.MedicalRecordRepository;
import com.hms.amazecare.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class LabResultsService {

    private final UserRepository userRepository;
    private final LabResultRepository labResultRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final ExecutiveRepository executiveRepository;
    Logger logger = LoggerFactory.getLogger(LabResultsService.class);

    public List<LabResultsDto> fetchLabResults(Long recordId,
                                               String userEmail,
                                               LabTestName testName,
                                               LabTestStatus status) {

        //check medical record
        MedicalRecord medicalRecord = medicalRecordRepository.findById(recordId)
                .orElseThrow(()-> new ResourceNotFoundException("Invalid Medical Record Id"));

        // check user
        User user = userRepository.findByEmail(userEmail);
        if(user == null || user.getStatus() != UserStatus.ACTIVE){
            throw new ResourceNotFoundException("User is Not found");
        }

        // check user is authorized for this op
        Role userRole = user.getRole();
        switch (userRole){
            case PATIENT->{
                if(!user.getId().equals(medicalRecord.getAppointment().getPatient().getUser().getId())){
                    throw new AccessDeniedException("Patient can only access their Records");
                }
            }
            case DOCTOR ->{
                if(!user.getId().equals(medicalRecord.getAppointment().getDoctor().getUser().getId())){
                    throw new AccessDeniedException("Doctor can only see their prepared Records");
                }
            }case ADMIN, EXECUTIVE -> {}
            default -> throw new AccessDeniedException("Access Denied");
        }

        return labResultRepository.getLabResultsByMedicalRecordId(recordId, testName, status);

    }

    public LabResultsDto updateLabResults(String userEmail, @Valid LabResultUpdateDto labResultUpdateDto, Long labResultId) {

        LabResult labResult = labResultRepository.findById(labResultId)
                .orElseThrow(()-> new ResourceNotFoundException("Invalid LabResultId"));

        // check user
        User user = userRepository.findByEmail(userEmail);
        if(user == null || user.getStatus() != UserStatus.ACTIVE){
            throw new ResourceNotFoundException("User is Not found");
        }
        if(user.getRole() != Role.EXECUTIVE){
            throw new AccessDeniedException("Only Executive can changes to LabResults");
        }

        // updates the values
        if(labResultUpdateDto.testStatus() != null){
            labResult.setTestStatus(labResultUpdateDto.testStatus());
        }
        if(labResultUpdateDto.resultValue() != null){
            labResult.setResultValue(labResultUpdateDto.resultValue());
        }
        if(labResultUpdateDto.resultDate() != null){
            labResult.setResultDate(labResultUpdateDto.resultDate());
        }
        labResultRepository.save(labResult);

        return LabResultMapper.createResponseDto(labResult);

    }

    public void upload(String executiveEmail, MultipartFile file, Long labRecordId) {

        Executive executive = executiveRepository.findByUserEmail(executiveEmail);

        LabResult labResult = labResultRepository.findById(labRecordId)
                .orElseThrow(()-> new ResourceNotFoundException("lab result Id is invalid"));

        if(file == null|| file.isEmpty())
            throw new NullPointerException("Please upload valid file");

        logger.info("Uploaded file name {} ", file.getOriginalFilename());
        logger.info("File size {}", file.getSize());

        String extension = Objects.requireNonNull(file.getOriginalFilename()).split("\\.")[1];
        logger.info("File extension {}", extension);

    }
}
