package com.hms.amazecare.controller;

import com.hms.amazecare.dto.request.ExecutiveDto;
import com.hms.amazecare.service.ExecutiveService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ExecutiveController {
    private final ExecutiveService executiveService;

    @PostMapping("/api/v1/register/{adminId}/executive")
    public void registerExecutive(@RequestBody ExecutiveDto executiveDto,
                                  @PathVariable Long adminId){
        executiveService.registerExecutive(executiveDto, adminId);

    }
}
