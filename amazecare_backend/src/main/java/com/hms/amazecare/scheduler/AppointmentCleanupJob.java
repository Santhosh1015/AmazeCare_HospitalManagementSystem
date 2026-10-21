package com.hms.amazecare.scheduler;

import com.hms.amazecare.enums.AppointmentStatus;
import com.hms.amazecare.repository.AppointmentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class AppointmentCleanupJob {

    private static final Logger log = LoggerFactory.getLogger(AppointmentCleanupJob.class);

    private final AppointmentRepository appointmentRepository;
    private final Clock clock;

    // every night at 00:05 Indian time
    @Scheduled(cron = "0 5 0 * * *", zone = "Asia/Kolkata")
    @Transactional
    public void closeOverdueAppointments() {
        LocalDateTime now = LocalDateTime.now(clock);
        LocalDate today = now.toLocalDate();

        // confirmed, but the date passed and no consultation happened
        int missed = appointmentRepository.closeOverdue(
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.NO_SHOW,
                "Auto-closed: the appointment date passed without a consultation",
                today, now);

        // never got a doctor before the preferred date
        int expired = appointmentRepository.closeOverdue(
                AppointmentStatus.REQUESTED,
                AppointmentStatus.CANCELLED,
                "Auto-cancelled: no doctor was assigned before the appointment date",
                today, now);

        log.info("Overdue appointments closed: {} no-show, {} unassigned", missed, expired);
    }
}
