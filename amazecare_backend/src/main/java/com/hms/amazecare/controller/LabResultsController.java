package com.hms.amazecare.controller;

import com.hms.amazecare.dto.request.LabResultUpdateDto;
import com.hms.amazecare.dto.response.LabResultsDto;
import com.hms.amazecare.enums.LabTestName;
import com.hms.amazecare.enums.LabTestStatus;
import com.hms.amazecare.service.LabResultsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class LabResultsController {

    private final LabResultsService labResultsService;

    @GetMapping("/api/v1/medical-record/{recordId}/lab-results")
    public List<LabResultsDto> fetchLabResults(@PathVariable Long recordId,
                                               @RequestParam(required = false) LabTestName testName,
                                               @RequestParam(required = false) LabTestStatus status,
                                              Principal principal){
        return labResultsService.fetchLabResults(recordId, principal.getName(),testName,status);
    }

    @PutMapping("/api/v1/update/lab-results/{labResultId}")
    public LabResultsDto updateLabResults(@Valid  @RequestBody LabResultUpdateDto labResultUpdateDto,
                                            @PathVariable Long labResultId,
                                            Principal principal){
        return labResultsService.updateLabResults(principal.getName(), labResultUpdateDto , labResultId);

    }

    @PostMapping("/api/v1/upload/lab-results/{labResultId}")
    public void upload(@RequestParam("file") MultipartFile file,
                       Principal principal,
                       @PathVariable Long recordId){
        labResultsService.upload(principal.getName(), file , recordId);
    }

}
