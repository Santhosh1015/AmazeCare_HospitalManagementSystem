package com.hms.amazecare.service;

import com.hms.amazecare.dto.request.AdminDto;
import com.hms.amazecare.enums.Role;
import com.hms.amazecare.mapper.AdminMapper;
import com.hms.amazecare.model.Admin;
import com.hms.amazecare.model.User;
import com.hms.amazecare.repository.AdminRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserService userService;
    private final AdminRepository adminRepository;
    public void registerAdmin(@Valid AdminDto adminDto) {
        User user = userService.createUser(adminDto.email(), adminDto.password(), Role.ADMIN);

        Admin admin = AdminMapper.convertDtoToEntity(adminDto);

        admin.setUser(user);

        adminRepository.save(admin);
    }
}
