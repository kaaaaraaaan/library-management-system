package com.library.lms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoanDTO {
    private Long id;

    @NotNull(message = "Book ID is required")
    private Long bookId;
    private String bookTitle;

    @NotNull(message = "Member ID is required")
    private Long memberId;
    private String memberName;

    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private String status;
    private Double fineAmount;
}
