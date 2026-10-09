package com.hms.amazecare.service;

import com.hms.amazecare.dto.request.DoctorDto;
import com.hms.amazecare.enums.Role;
import com.hms.amazecare.exception.ResourceNotFoundException;
import com.hms.amazecare.mapper.DoctorMapper;
import com.hms.amazecare.model.Doctor;
import com.hms.amazecare.model.Executive;
import com.hms.amazecare.model.User;
import com.hms.amazecare.repository.DoctorRepository;
import com.hms.amazecare.repository.ExecutiveRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DoctorService {
    private final DoctorRepository doctorRepository;
    private final UserService userService;
    private final ExecutiveRepository executiveRepository;

    public void registerDoctor(@Valid DoctorDto doctorDto, Long executiveId) {
        User user = userService.createUser(
                doctorDto.email(),
                doctorDto.password(),
                Role.DOCTOR
        );

        Executive executive = executiveRepository.findById(executiveId)
                .orElseThrow(()-> new ResourceNotFoundException("Executive Id is Invalid"));

        Doctor doctor = DoctorMapper.convertDtoIntoEntity(doctorDto);

        doctor.setUser(user);
        doctor.setCreatedBy(executive.getUser());

        doctorRepository.save(doctor);

    }
}
