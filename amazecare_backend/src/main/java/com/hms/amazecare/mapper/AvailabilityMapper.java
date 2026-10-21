package com.hms.amazecare.mapper;

import com.hms.amazecare.dto.request.AvailabilityDto;
import com.hms.amazecare.dto.response.AvailabilityRespDto;
import com.hms.amazecare.model.DoctorAvailability;

public class AvailabilityMapper {

    public static DoctorAvailability convertDtoToEntity(AvailabilityDto availabilityDto) {
        DoctorAvailability doctorAvailability = new DoctorAvailability();
        doctorAvailability.setDayOfWeek(availabilityDto.dayOfWeek());
        doctorAvailability.setStartTime(availabilityDto.startTime());
        doctorAvailability.setEndTime(availabilityDto.endTime());
        doctorAvailability.setSlotDuration(availabilityDto.slotDuration());

        return doctorAvailability;
    }

    public static AvailabilityRespDto convertEntityToDto(DoctorAvailability doctorAvailability) {
        return new AvailabilityRespDto(doctorAvailability.getId(),
                doctorAvailability.getDayOfWeek(),
                doctorAvailability.getStartTime(),
                doctorAvailability.getEndTime(),
                doctorAvailability.getSlotDuration());
    }
}
