package com.hms.amazecare.dto.response;

import java.util.List;

public record AdminDashboardSummaryDto(
        String adminName,
        Long totalPatients,
        Long totalDoctors,
        Long todayAppointments,
        Long pendingRequests,
        List<AppointmentStatusCountDto> statusCounts,
        List<TodayAppointmentDto> todayAppointmentList,
        List<RecentPatientDto> recentPatients,
        List<DoctorSpecializationCountDto> doctorsBySpecialization
) {
}
