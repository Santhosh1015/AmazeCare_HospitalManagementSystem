package com.hms.amazecare.mapper;

import com.hms.amazecare.dto.request.AdminDto;
import com.hms.amazecare.model.Admin;
import jakarta.validation.Valid;
import org.springframework.stereotype.Component;

@Component
public class AdminMapper {
    public static Admin convertDtoToEntity(@Valid AdminDto adminDto) {
        Admin admin = new Admin();
        admin.setDesignation(adminDto.designation());
        admin.setFirstName(adminDto.firstName());
        admin.setLastName(adminDto.lastName());
        admin.setEmployeeId(adminDto.employeeId());
        return admin;
    }
}
