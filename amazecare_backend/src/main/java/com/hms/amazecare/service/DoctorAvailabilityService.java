package com.hms.amazecare.service;

import com.hms.amazecare.dto.request.AvailabilityDto;
import com.hms.amazecare.dto.response.AvailabilityDatesDto;
import com.hms.amazecare.dto.response.AvailabilityRespDto;
import com.hms.amazecare.dto.response.Slots;
import com.hms.amazecare.dto.response.SlotsDto;
import com.hms.amazecare.enums.UserStatus;
import com.hms.amazecare.exception.InvalidDataException;
import com.hms.amazecare.exception.ResourceNotFoundException;
import com.hms.amazecare.mapper.AvailabilityMapper;
import com.hms.amazecare.model.Appointment;
import com.hms.amazecare.model.Doctor;
import com.hms.amazecare.model.DoctorAvailability;
import com.hms.amazecare.repository.AppointmentRepository;
import com.hms.amazecare.repository.DoctorAvailabilityRepository;
import com.hms.amazecare.repository.DoctorRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorAvailabilityService {
    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final Clock clock;

    @Transactional
    public AvailabilityDatesDto getDoctorAvailability(Long doctorId,
                                                      Integer days) {
        // check the days can be null since required is false
        int noOfDays = (days == null) ? 10 : Math.min(Math.max(days , 1), 30);
        //checks the doctor id
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(()-> new ResourceNotFoundException("DoctorID is Invalid"));
        // check the doctor staus
        if (doctor.getUser().getStatus() != UserStatus.ACTIVE) {
            throw new ResourceNotFoundException("Doctor is not available");
        }

        // also checks the availability contains doctors data
        List<DoctorAvailability> availabilities =  availabilityRepository.findByDoctorId(doctorId);

        if(availabilities.isEmpty()){
            throw new ResourceNotFoundException("Availability Data no found for DoctorID");
        }

        // get the week days for the doctor
        // one doctor may have diff time slots for one day = <SET> eg mon mon
        Set<DayOfWeek> workingDays = availabilities
                .stream()
                .map(DoctorAvailability::getDayOfWeek)
                .collect(Collectors.toSet());

        LocalDate today = LocalDate.now(clock);

        // calculate the next dates for next {days} specified
        List<LocalDate> dates  = today.datesUntil(today.plusDays(noOfDays))
                .filter(date-> workingDays.contains(date.getDayOfWeek())) //
                .toList();

            return new AvailabilityDatesDto(doctorId , dates);
    }

    @Transactional
    public SlotsDto getSlots(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (doctor.getUser().getStatus() != UserStatus.ACTIVE) {
            throw new InvalidDataException("Doctor is not available for booking");
        }
        return new SlotsDto(doctorId, date, generateSlots(doctor, date));
    }

    @Transactional
    public List<Slots> generateSlots(Doctor doctor,
                                          LocalDate date) {

        LocalDateTime now = LocalDateTime.now(clock);
        LocalDate today = now.toLocalDate();
        LocalTime nowTime = now.toLocalTime();

        validateBookingDate(date, today);

        List<Appointment> bookedAppointmentList = appointmentRepository.getBookedAppointmentTiming(doctor.getId(), date);

        // get the booked timings = confirmed-requested-completed-rescheduled - !CANCELLED
        Set<LocalTime> bookedTimings = bookedAppointmentList
                .stream()
                .map(Appointment::getAppointmentTime)
                .collect(Collectors.toSet());


        //get the records from the availability table for timings
        List<Slots> slotsList = new ArrayList<>();

        // getting the available timings for a day
        List<DoctorAvailability> availabilities = availabilityRepository.findByDoctorIdAndDayOfWeek(doctor.getId() , date.getDayOfWeek());

        for(DoctorAvailability a : availabilities){
            LocalTime time = a.getStartTime();

            while(!(time.plusMinutes(a.getSlotDuration())).isAfter(a.getEndTime())){

                // if the patient checking today and the check time is passed
                boolean passed = date.equals(today) && time.isBefore(nowTime);

                boolean isAvailable = !bookedTimings.contains(time) && !passed;

                slotsList.add(new Slots(time , isAvailable));

                time = time.plusMinutes(a.getSlotDuration());
            }
        }
        slotsList
                .sort(Comparator.comparing(Slots::slotTime));
        return slotsList;
    }

    @Transactional
    private void validate(Long doctorId,
                          AvailabilityDto availabilityDto ,
                          Long availabilityID){

        // the slot duration must be btn 5 to 60 minutes
        Integer slotDuration = availabilityDto.slotDuration();
        if(slotDuration < 5 || slotDuration > 60 || !(slotDuration%5 == 0)){
            throw new InvalidDataException("The slot Duration Must be Between 5 and 60 Minutes");
        }

        // the time duration must divide the slot into whole
        LocalTime startTime = availabilityDto.startTime();
        LocalTime endTime = availabilityDto.endTime();

        if(!startTime.isBefore(endTime)){
            throw new InvalidDataException("Start Time must be before End Time");
        }

        long totalMinutes = Duration.between(startTime, endTime).toMinutes();
        if(totalMinutes % slotDuration != 0){
            throw new InvalidDataException("The time window must be whole number of slots");
        }

        // check the timings shouldn't be overlapped
        List<DoctorAvailability> onSameDay = availabilityRepository.findByDoctorIdAndDayOfWeek(doctorId , availabilityDto.dayOfWeek());

        for(DoctorAvailability day : onSameDay){
            if(day.getId().equals(availabilityID)) {
                continue;
            }

            if (availabilityDto.startTime().isBefore(day.getEndTime())
                    && availabilityDto.endTime().isAfter(day.getStartTime())) {
                throw new InvalidDataException("Time overlaps with existing availability");
            }
        }


    }

    public void validateBookingDate(LocalDate date, LocalDate today){
        // checks the data as valid for double-checking

        if(date == null || date.isBefore(today)||date.isAfter(today.plusDays(30))){
            throw new InvalidDataException("Given date is Invalid");
        }
    }

    @Transactional
    public AvailabilityRespDto addAvailability(AvailabilityDto availabilityDto,
                                               Long doctorId) {
        // check the doctorId
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        //validate the input date in method
        validate(doctorId, availabilityDto , null);

        DoctorAvailability doctorAvailability = AvailabilityMapper.convertDtoToEntity(availabilityDto);

        doctorAvailability.setDoctor(doctor);

        return AvailabilityMapper.convertEntityToDto(availabilityRepository.save(doctorAvailability));
    }

    @Transactional
    public AvailabilityRespDto updateAvailability(Long doctorId,
                                                  Long availabilityId,
                                                  AvailabilityDto availabilityDto) {

        DoctorAvailability doctorAvailability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new ResourceNotFoundException("No such Data not found for this ID"));

        if(!doctorAvailability.getDoctor().getId().equals(doctorId)){
            throw  new ResourceNotFoundException("Availability Data not found for this Doctor");
        }

        validate(doctorId , availabilityDto , availabilityId);

        doctorAvailability.setDayOfWeek(availabilityDto.dayOfWeek());
        doctorAvailability.setStartTime(availabilityDto.startTime());
        doctorAvailability.setEndTime(availabilityDto.endTime());
        doctorAvailability.setSlotDuration(availabilityDto.slotDuration());

        return AvailabilityMapper.convertEntityToDto(availabilityRepository.save(doctorAvailability));
    }


    public boolean isSlotAvailable(Doctor doctor, LocalDate date, LocalTime time) {

        return generateSlots(doctor, date)
                .stream()
                .anyMatch(slot -> slot.slotTime().equals(time) && slot.available());
    }
}
