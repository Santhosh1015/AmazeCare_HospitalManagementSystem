package com.hms.amazecare.controller;

import com.hms.amazecare.dto.request.AdminDto;
import com.hms.amazecare.dto.response.AdminDashboardSummaryDto;
import com.hms.amazecare.enums.Role;
import com.hms.amazecare.service.AdminService;
import com.hms.amazecare.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {
    private final UserService userService;
    private final AdminService adminService;

    // it can only call once after it was Denied to call
    @PostMapping("/api/v1/admin/add")
    public void addAdmin(@Valid  @RequestBody AdminDto adminDto){
        userService.createUser(adminDto.email(),
                adminDto.password(),
                Role.ADMIN);
    }
    @PutMapping("/api/v1/admin/{adminId}/delete/")
    public void deleteAdmin(@PathVariable Long adminId){
        userService.deleteUser(adminId);
    }

    @GetMapping("/api/v1/admin/dashboard/summary")
    public AdminDashboardSummaryDto getDashboardSummary(Principal principal) {

        return adminService.getDashboardSummary(principal.getName());

    }

}
