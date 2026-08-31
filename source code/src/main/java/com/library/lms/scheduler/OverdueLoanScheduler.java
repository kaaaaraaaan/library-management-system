package com.library.lms.scheduler;

import com.library.lms.entity.Loan;
import com.library.lms.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Scheduled task that runs daily to detect overdue loans,
 * mark them as OVERDUE, and send an email notification (if enabled)
 * to remind members to return their books.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OverdueLoanScheduler {

    private final LoanRepository loanRepository;
    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    // Runs every day at 8:00 AM
    @Scheduled(cron = "0 0 8 * * *")
    public void checkOverdueLoans() {
        List<Loan> overdue = loanRepository.findOverdueLoans(LocalDate.now());
        for (Loan loan : overdue) {
            loan.setStatus(Loan.LoanStatus.OVERDUE);
            loanRepository.save(loan);
            notifyMember(loan);
        }
        log.info("Overdue loan check completed. {} loan(s) marked overdue.", overdue.size());
    }

    private void notifyMember(Loan loan) {
        if (!mailEnabled) {
            log.info("[Email Simulation] Reminder: {} - Book '{}' was due on {}",
                    loan.getMember().getEmail(), loan.getBook().getTitle(), loan.getDueDate());
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(loan.getMember().getEmail());
            message.setSubject("Library Book Overdue Reminder");
            message.setText("Dear " + loan.getMember().getFullName() +
                    ",\n\nThe book \"" + loan.getBook().getTitle() + "\" was due on " + loan.getDueDate() +
                    ". Please return it as soon as possible to avoid additional fines.\n\nThank you,\nLibrary Management System");
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send overdue email to {}: {}", loan.getMember().getEmail(), e.getMessage());
        }
    }
}
