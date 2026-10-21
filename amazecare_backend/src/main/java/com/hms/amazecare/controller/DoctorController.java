package com.hms.amazecare.controller;

import com.hms.amazecare.dto.request.DoctorDto;
import com.hms.amazecare.dto.response.DoctorProfileResDto;
import com.hms.amazecare.enums.Specialization;
import com.hms.amazecare.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping("/api/v1/doctor/add")
    public ResponseEntity<DoctorProfileResDto> registerDoctor(@Valid @RequestBody DoctorDto doctorDto,
                                                              Principal principal){
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(doctorService.registerDoctor(doctorDto , principal.getName()));
    }

    @PutMapping("/api/v1/doctor/{doctorId}/update")
    public ResponseEntity<DoctorProfileResDto> updateDoctor(@Valid @RequestBody DoctorDto doctorDto,
                                                     @PathVariable Long doctorId,
                                                     Principal principal){
        return ResponseEntity
                .ok()
                .body(doctorService.updateDoctorProfile(principal.getName(),doctorId, doctorDto));
    }

    //use cases:
    // 1. helps to assign doctor by executive
    // 2. fetch by the patient to see doctors
    @GetMapping("/api/v1/doctors")
    public List<DoctorProfileResDto> viewDoctors(@RequestParam(name = "Specialization" , required = false)Specialization specialization,
                                           @RequestParam(name = "page", required = false , defaultValue = "0")Integer page,
                                           @RequestParam(name = "size", required = false , defaultValue = "10")Integer size) {
       return doctorService.viewDoctors(specialization , page , size);
    }

    @GetMapping("/api/v1/doctors/{doctorId}")
    public DoctorProfileResDto viewDoctorProfile(@PathVariable Long doctorId) {
        return doctorService.viewDoctorProfile(doctorId );
    }

    @PutMapping("/api/v1/doctor/{doctorId}/delete")
    public void deleteDoctor(@PathVariable Long  doctorId,
                                  Principal principal){
        doctorService.deleteDoctor(doctorId , principal.getName());
    }
}
