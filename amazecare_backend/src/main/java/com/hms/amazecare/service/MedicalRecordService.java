package com.hms.amazecare.service;

import com.hms.amazecare.dto.response.*;
import com.hms.amazecare.enums.Role;
import com.hms.amazecare.enums.UserStatus;
import com.hms.amazecare.exception.AccessDeniedException;
import com.hms.amazecare.exception.ResourceNotFoundException;
import com.hms.amazecare.mapper.ConsultationMapper;
import com.hms.amazecare.mapper.MedicalRecordMapper;
import com.hms.amazecare.mapper.PrescriptionMapper;
import com.hms.amazecare.model.*;
import com.hms.amazecare.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository itemRepository;
    private final LabResultRepository labResultRepository;
    private final PatientRepository patientRepository;

    public MedicalRecordResDto fetchMedicalRecord(Long recordId, String userEmail) {

        //check medical record
        MedicalRecord medicalRecord = medicalRecordRepository.findById(recordId)
                .orElseThrow(()-> new ResourceNotFoundException("Invalid Medical Record Id"));
        // check user
        User user = userRepository.findByEmail(userEmail);
        if (user == null) {
            throw new AccessDeniedException("Access denied");
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

        return MedicalRecordMapper.createResponseDto(medicalRecord);
    }

    @Transactional
    public List<PatientMedicalHistoryDto> fetchPatientMedicalHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail);
        if (user == null || user.getStatus() != UserStatus.ACTIVE) {
            throw new ResourceNotFoundException("user not found");
        }
        if (user.getRole() != Role.PATIENT) {
            throw new AccessDeniedException("Only patients can see their medical records");
        }

        List<MedicalRecord> records = medicalRecordRepository.fetchMedicalRecordsByEmail(userEmail);
        // if no records found give the [] list
        if (records.isEmpty()) {
            return List.of();
        }

        List<PatientMedicalHistoryDto> response = new ArrayList<>();
        for(MedicalRecord record : records){

            Long id = record.getId();

            List<LabResult> labResults = labResultRepository.fetchByRecordId(id);

            List<LabResultsDto> labsResultList = labResults.stream()
                    .map( list -> new LabResultsDto(list.getId(), list.getTestName(), list.getTestStatus(), list.getResultValue(), list.getResultDate()))
                    .toList();

            Prescription prescription = prescriptionRepository.fetchPrescriptionByRecordId(id);

            PrescriptionResDto prescriptionResDto = null;

            if (prescription != null) {

                List<PrescriptionItem> items = itemRepository.fetchPrescribedDataById(prescription.getId());

                List<PrescribedItemResDto> itemDtos = items.stream()
                        .map(ConsultationMapper::convertPrescribedItemToDto)
                        .toList();

                prescriptionResDto = new PrescriptionResDto(
                        prescription.getId(),
                        prescription.getInstructions(),
                        itemDtos
                );
            }
            PatientMedicalHistoryDto patientMedicalHistoryDto = MedicalRecordMapper.createPatientHistory(record,labsResultList, prescriptionResDto);
            response.add(patientMedicalHistoryDto);
        }
        return response;
    }

    @Transactional
    public List<DoctorConsultationResDto> getPatientMedicalHistory(Long patientId, String userEmail) {

        User user = userRepository.findByEmail(userEmail);

        if (user == null || user.getStatus() != UserStatus.ACTIVE) {
            throw new ResourceNotFoundException("user not found");
        }

        if (user.getRole() != Role.DOCTOR) {
            throw new AccessDeniedException("Only doctors can view patient medical records");
        }

        patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        List<MedicalRecord> records = medicalRecordRepository.fetchMedicalRecordsByPatientAndDoctor(patientId, userEmail);

        if (records.isEmpty()) {
            return List.of();
        }

        List<DoctorConsultationResDto> response = new ArrayList<>();

        for (MedicalRecord record : records) {

            Long id = record.getId();

            Appointment appointment = record.getAppointment();

            List<LabResult> labResults = labResultRepository.fetchByRecordId(id);
            Prescription prescription = prescriptionRepository.fetchPrescriptionByRecordId(id);

            List<PrescriptionItem> items = prescription == null ? List.of() : itemRepository.fetchPrescribedDataById(prescription.getId());

            DoctorConsultationResDto dto = ConsultationMapper.createDoctorConsultationResDto(appointment, record, prescription, items, labResults);
            response.add(dto);
        }

        return response;
    }
}
