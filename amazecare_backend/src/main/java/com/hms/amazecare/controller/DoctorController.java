package com.hms.amazecare.controller;

import com.hms.amazecare.dto.request.DoctorDto;
import com.hms.amazecare.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping("/api/register/{executive}/doctor/")
    public void  registerDoctor(@Valid @RequestBody DoctorDto doctorDto,
                          @PathVariable Long executiveId ){
        doctorService.registerDoctor(doctorDto , executiveId);
    }
}
