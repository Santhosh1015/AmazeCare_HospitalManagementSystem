package com.hms.amazecare.controller;

import com.hms.amazecare.dto.request.AdminDto;
import com.hms.amazecare.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @PostMapping("/api/v1/admin/add")
    public void registerAdmin(@Valid @RequestBody AdminDto adminDto){
        adminService.registerAdmin(adminDto);
    }
}
