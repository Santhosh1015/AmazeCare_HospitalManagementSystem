package com.hms.amazecare.service;

import com.hms.amazecare.dto.request.ExecutiveDto;
import com.hms.amazecare.enums.Role;
import com.hms.amazecare.exception.ResourceNotFoundException;
import com.hms.amazecare.mapper.ExecutiveMapper;
import com.hms.amazecare.model.Admin;
import com.hms.amazecare.model.Executive;
import com.hms.amazecare.model.User;
import com.hms.amazecare.repository.AdminRepository;
import com.hms.amazecare.repository.ExecutiveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExecutiveService {

    private final ExecutiveRepository executiveRepository;
    private final UserService userService;
    private final AdminRepository adminRepository;

    public void registerExecutive(ExecutiveDto executiveDto, Long adminId) {
        User user = userService.createUser(
                executiveDto.email(),
                executiveDto.password(),
                Role.EXECUTIVE
        );

        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(()->new ResourceNotFoundException("Admin Id Invalid"));

        Executive executive = ExecutiveMapper.convertDtoIntoEntity(executiveDto);

        executive.setUser(user);
        executive.setCreatedBy(admin.getUser());

        executiveRepository.save(executive);



    }
}
