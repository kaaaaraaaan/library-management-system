package com.library.lms.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "loan")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    private LocalDate issueDate;

    private LocalDate dueDate;

    private LocalDate returnDate;

    @Enumerated(EnumType.STRING)
    private LoanStatus status;

    private Double fineAmount;

    public enum LoanStatus { ISSUED, RETURNED, OVERDUE }

    @PrePersist
    public void prePersist() {
        if (issueDate == null) issueDate = LocalDate.now();
        if (dueDate == null) dueDate = issueDate.plusDays(14);
        if (status == null) status = LoanStatus.ISSUED;
        if (fineAmount == null) fineAmount = 0.0;
    }
}
