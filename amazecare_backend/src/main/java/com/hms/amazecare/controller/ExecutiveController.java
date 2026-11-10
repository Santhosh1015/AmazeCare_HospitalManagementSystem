package com.hms.amazecare.controller;

import com.hms.amazecare.dto.request.ExecutiveDto;
import com.hms.amazecare.dto.request.ExecutiveUpdateDto;
import com.hms.amazecare.dto.request.UpdateDoctorDto;
import com.hms.amazecare.dto.response.ExecutiveDetailsResDto;
import com.hms.amazecare.dto.response.ExecutiveReportDto;
import com.hms.amazecare.dto.response.ExecutiveResDto;
import com.hms.amazecare.enums.ExecutiveDesignation;
import com.hms.amazecare.service.ExecutiveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ExecutiveController {
    private final ExecutiveService executiveService;

    @PostMapping("/api/v1/executive/register")
    public ResponseEntity<ExecutiveResDto> registerExecutive(@Valid @RequestBody ExecutiveDto executiveDto,
                                                            Principal principal
    ){
        return ResponseEntity.ok()
                .body(executiveService.registerExecutive(executiveDto, principal.getName()));
    }

    @GetMapping("/api/v1/executives")
    public Page<ExecutiveResDto> fetchExecutives(@RequestParam(name = "page", required = false, defaultValue = "0") Integer page,
                                                 @RequestParam(name = "size", required = false, defaultValue = "10") Integer size) {

        return executiveService.fetchExecutives(page, size);
    }

    @GetMapping("/api/v1/executive/{executiveId}")
    public ExecutiveDetailsResDto fetchExecutive(@PathVariable Long executiveId) {
        return executiveService.fetchExecutive(executiveId);
    }
    @PutMapping("/api/v1/executive/{executiveId}/update")
    public ResponseEntity<ExecutiveResDto> updateExecutive(@PathVariable Long executiveId,
                                                           @Valid @RequestBody ExecutiveUpdateDto executiveDto,
                                                            Principal principal){
        return ResponseEntity.ok()
                .body(executiveService.updateExecutive( executiveId, principal.getName(),executiveDto));
    }
    @PutMapping("/api/v1/executive/{executiveId}/delete")
    public void deleteExecutive(@PathVariable Long  executiveId,
                                  Principal principal){
        executiveService.deleteExecutive( executiveId , principal.getName());

    }

    @GetMapping("/api/v1/executives/admin/report")
    public ExecutiveReportDto getExecutiveReport(@RequestParam(name = "designation", required = false) ExecutiveDesignation designation,
                                                 @RequestParam(name = "fromDate", required = false) LocalDate fromDate,
                                                 @RequestParam(name = "toDate", required = false) LocalDate toDate,
                                                 @RequestParam(name = "page", required = false, defaultValue = "0") Integer page,
                                                 @RequestParam(name = "size", required = false, defaultValue = "10") Integer size) {

        return executiveService.getExecutiveReport(designation, fromDate, toDate, page, size);
    }

}
