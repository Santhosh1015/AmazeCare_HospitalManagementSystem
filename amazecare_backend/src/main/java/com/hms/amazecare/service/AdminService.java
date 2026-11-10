package com.hms.amazecare.service;

import com.hms.amazecare.dto.response.*;
import com.hms.amazecare.enums.AppointmentStatus;
import com.hms.amazecare.repository.AppointmentRepository;
import com.hms.amazecare.repository.DoctorRepository;
import com.hms.amazecare.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final Clock clock;

    public AdminDashboardSummaryDto getDashboardSummary(String adminEmail) {

        LocalDate today = LocalDate.now(clock);

        Long totalPatients = patientRepository.countActivePatients();
        Long totalDoctors = doctorRepository.countActiveDoctors();

        Long todayAppointments = appointmentRepository.countTodayAppointments(today);

        Long pendingRequests = appointmentRepository.countByStatus(AppointmentStatus.REQUESTED);

        List<AppointmentStatusCountDto> statusCounts = appointmentRepository.getAppointmentStatusCounts();

        List<TodayAppointmentDto> todayAppointmentList = appointmentRepository.getTodayAppointments(today);

        List<RecentPatientDto> recentPatients = patientRepository.getRecentPatients();

        List<DoctorSpecializationCountDto> doctorsBySpecialization = doctorRepository.getDoctorCountsBySpecialization();

        return new AdminDashboardSummaryDto(
                "Admin",
                totalPatients,
                totalDoctors,
                todayAppointments,
                pendingRequests,
                statusCounts,
                todayAppointmentList,
                recentPatients,
                doctorsBySpecialization
        );
    }
}
