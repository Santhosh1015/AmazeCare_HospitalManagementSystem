package com.hms.amazecare.dto.response;

public record PatientDashboardSummaryDto(
        String patientName,
        long upcomingAppointments,
        long completedVisits,
        long cancelledAppointments,
        long pendingAppointments
) {
}
