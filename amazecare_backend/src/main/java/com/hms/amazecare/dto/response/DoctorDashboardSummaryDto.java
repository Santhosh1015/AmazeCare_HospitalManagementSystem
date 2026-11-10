package com.hms.amazecare.dto.response;

import java.util.List;

public record DoctorDashboardSummaryDto(
        String doctorName,
        String specialization,
        Long totalPatients,
        Long todayAppointments,
        Long completedAppointments,
        Long pendingAppointments,
        Long cancelledAppointments,
        Long noShowAppointments,
        List<AppointmentDetailsResDto> todayAppointmentList
) {
}
