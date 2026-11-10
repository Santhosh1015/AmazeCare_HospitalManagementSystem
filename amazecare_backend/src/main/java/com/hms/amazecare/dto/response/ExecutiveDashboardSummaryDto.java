package com.hms.amazecare.dto.response;

public record ExecutiveDashboardSummaryDto(
        String executiveName,
        long pendingRequests,
        long todayAppointments,
        long confirmedAppointments,
        long cancelledAppointments
) {}