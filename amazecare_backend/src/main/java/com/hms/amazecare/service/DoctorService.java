package com.hms.amazecare.service;

import com.hms.amazecare.dto.request.DoctorDto;
import com.hms.amazecare.dto.response.DoctorProfileResDto;
import com.hms.amazecare.enums.Role;
import com.hms.amazecare.enums.Specialization;
import com.hms.amazecare.enums.UserStatus;
import com.hms.amazecare.exception.AccessDeniedException;
import com.hms.amazecare.exception.ResourceNotFoundException;
import com.hms.amazecare.mapper.DoctorMapper;
import com.hms.amazecare.model.Doctor;
import com.hms.amazecare.model.Patient;
import com.hms.amazecare.model.User;
import com.hms.amazecare.repository.DoctorRepository;
import com.hms.amazecare.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {
    private final DoctorRepository doctorRepository;
    private final UserService userService;
    private final UserRepository userRepository;

    public DoctorProfileResDto registerDoctor(@Valid DoctorDto doctorDto, String authorityUsername) {
        //preparing the user object
        User user = userService.createUser(
                doctorDto.email(),
                doctorDto.password(),
                Role.DOCTOR
        );

        // map the dto to entity
        Doctor doctor = DoctorMapper.convertDtoIntoEntity(doctorDto);

        doctor.setUser(user);

        // get the user by the authority, who is logged-in (ADMIN , EXECUTIVE)
        doctor.setCreatedBy(userRepository.findByEmail(authorityUsername));

        return DoctorMapper.convertEntityToDto(doctorRepository.save(doctor));

    }

    public DoctorProfileResDto updateDoctorProfile(String userEmail, Long doctorId, @Valid DoctorDto doctorDto) {

        // check the user for update
        User user = userRepository.findByEmail(userEmail);
         if(user.getRole() != Role.EXECUTIVE &&user.getRole() != Role.ADMIN){
             throw new AccessDeniedException("Only Executive and Admin can make Update");
         }

        Doctor doctor = doctorRepository.findById(doctorId)
                        .orElseThrow(()->new ResourceNotFoundException("Doctor Id is invalid"));
         if(doctor.getUser().getStatus() != UserStatus.ACTIVE){
             throw new AccessDeniedException("User is Inactive");
         }

        // update the fields
        doctor.setQualification(doctorDto.qualification());
        doctor.setSpecialization(doctorDto.specialization());
        doctor.setLicenseNumber(doctorDto.licenseNumber());
        doctor.setExperienceYears(doctorDto.experienceYears());
        doctor.setLastName(doctorDto.lastName());
        doctor.setFirstName(doctorDto.firstName());
        doctor.setDesignation(doctorDto.designation());

        // set the updatedBy field
        doctor.setUpdatedBy(user);

         return DoctorMapper.convertEntityToDto(doctorRepository.save(doctor));
    }

    public List<DoctorProfileResDto> viewDoctors(Specialization specialization, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);
        return doctorRepository.viewDoctors(specialization , pageable);

    }

    public DoctorProfileResDto viewDoctorProfile(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(()-> new ResourceNotFoundException("Invalid DoctorId"));

        return DoctorMapper.convertEntityToDto(doctor);
    }


    public void deleteDoctor(Long doctorId, String userEmail) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(()-> new ResourceNotFoundException("Doctor Id is invalid"));
        if(doctor.getUser().getStatus() != UserStatus.ACTIVE){
            throw new AccessDeniedException("User is already Inactive");
        }

        User user = userRepository.findByEmail(userEmail);
        if(user.getRole() != Role.EXECUTIVE && user.getRole() != Role.ADMIN ){
            throw new AccessDeniedException("ADMIN , EXECUTIVE can only delete Doctor");
        }

        // call the delete method in user service
        userService.deleteUser(doctor.getUser().getId());
    }
}
