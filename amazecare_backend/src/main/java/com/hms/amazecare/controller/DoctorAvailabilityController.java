package com.hms.amazecare.controller;

import com.hms.amazecare.dto.request.AvailabilityDto;
import com.hms.amazecare.dto.response.AvailabilityDatesDto;
import com.hms.amazecare.dto.response.AvailabilityRespDto;
import com.hms.amazecare.dto.response.SlotsDto;
import com.hms.amazecare.service.DoctorAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
public class DoctorAvailabilityController {
    private final DoctorAvailabilityService availabilityService;

    @PostMapping("/api/v1/doctor/{doctorId}/availability/add")
    public AvailabilityRespDto addDoctorAvailability(@RequestBody AvailabilityDto availabilityDto,
                                                     @PathVariable Long doctorId
                                      ){
        return availabilityService.addAvailability(availabilityDto , doctorId);
    }

    @PutMapping("/api/v1/doctor/{doctorId}/availability/{availabilityId}")
    public AvailabilityRespDto updateAvailability(@RequestBody AvailabilityDto availabilityDto,
                                                  @PathVariable Long doctorId,
                                                  @PathVariable Long availabilityId){
        return availabilityService.updateAvailability(doctorId , availabilityId , availabilityDto);
    }

    @GetMapping("/api/v1/doctor/{doctorId}/availability")
    public AvailabilityDatesDto getDoctorAvailability(@PathVariable Long doctorId,// the days must btn 10-30 days
                                                     @RequestParam(name = "days" , required = false ) Integer days){
        return availabilityService.getDoctorAvailability(doctorId , days);

    }
    @GetMapping("/api/v1/doctor/{doctorId}/availability/slots")
    public SlotsDto getSlotTimingFromDate(@RequestParam(name = "date")LocalDate date,
                                          @PathVariable Long doctorId){
        return availabilityService.getSlots(doctorId, date);
    }

}
