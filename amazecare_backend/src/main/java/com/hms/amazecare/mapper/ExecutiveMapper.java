package com.hms.amazecare.mapper;

import com.hms.amazecare.dto.request.ExecutiveDto;
import com.hms.amazecare.model.Executive;
import com.hms.amazecare.service.ExecutiveService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Component
public class ExecutiveMapper {

    public static Executive convertDtoIntoEntity(ExecutiveDto request) {
        Executive executive = new Executive();

        executive.setFirstName(request.firstName());
        executive.setLastName(request.lastName());
        executive.setEmployeeId(request.employeeId());
        executive.setDesignation(request.designation());
        return executive;
    }
}
