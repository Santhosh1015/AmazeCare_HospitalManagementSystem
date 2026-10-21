package com.hms.amazecare.controller;

import com.hms.amazecare.dto.request.ExecutiveDto;
import com.hms.amazecare.dto.response.ExecutiveResDto;
import com.hms.amazecare.service.ExecutiveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
public class ExecutiveController {
    private final ExecutiveService executiveService;

    @PostMapping("/api/v1/executive/register")
    public ResponseEntity<ExecutiveResDto> registerExecutive(@Valid @RequestBody ExecutiveDto executiveDto,
                                                            Principal principal
    ){
        return ResponseEntity.ok()
                .body(executiveService.registerExecutive(executiveDto, principal.getName()));
    }
    @PutMapping("/api/v1/executive/{executiveId}/update")
    public ResponseEntity<ExecutiveResDto> updateExecutive(@PathVariable Long executiveId,
                                                           @Valid @RequestBody ExecutiveDto executiveDto,
                                                            Principal principal){
        return ResponseEntity.ok()
                .body(executiveService.updateExecutive( executiveId, principal.getName(),executiveDto));
    }
    @PutMapping("/api/v1/executive/{executiveId}/delete")
    public void deleteExecutive(@PathVariable Long  executiveId,
                                  Principal principal){
        executiveService.deleteExecutive( executiveId , principal.getName());

    }

}
