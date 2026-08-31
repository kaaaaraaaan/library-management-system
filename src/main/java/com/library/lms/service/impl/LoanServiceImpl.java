package com.library.lms.service.impl;

import com.library.lms.dto.LoanDTO;
import com.library.lms.entity.Book;
import com.library.lms.entity.Loan;
import com.library.lms.entity.Member;
import com.library.lms.exception.BadRequestException;
import com.library.lms.exception.ResourceNotFoundException;
import com.library.lms.repository.BookRepository;
import com.library.lms.repository.LoanRepository;
import com.library.lms.repository.MemberRepository;
import com.library.lms.service.AuditService;
import com.library.lms.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class LoanServiceImpl implements LoanService {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final AuditService auditService;

    private static final double FINE_PER_DAY = 10.0; // NPR per day overdue

    @Override
    @Transactional
    public LoanDTO issueLoan(LoanDTO dto) {
        Book book = bookRepository.findById(dto.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + dto.getBookId()));
        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + dto.getMemberId()));

        if (book.getAvailableCopies() == null || book.getAvailableCopies() <= 0) {
            throw new BadRequestException("No available copies of book: " + book.getTitle());
        }
        if (member.getStatus() == Member.MemberStatus.SUSPENDED) {
            throw new BadRequestException("Member is suspended and cannot borrow books");
        }

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        Loan loan = Loan.builder().book(book).member(member).build();
        Loan saved = loanRepository.save(loan);
        auditService.log(currentUser(), "CREATE", "Loan", "Issued book " + book.getTitle() + " to " + member.getFullName());
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public LoanDTO returnLoan(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with id: " + loanId));
        if (loan.getStatus() == Loan.LoanStatus.RETURNED) {
            throw new BadRequestException("This loan has already been returned");
        }
        loan.setReturnDate(LocalDate.now());
        loan.setStatus(Loan.LoanStatus.RETURNED);

        if (loan.getReturnDate().isAfter(loan.getDueDate())) {
            long overdueDays = ChronoUnit.DAYS.between(loan.getDueDate(), loan.getReturnDate());
            loan.setFineAmount(overdueDays * FINE_PER_DAY);
        }

        Book book = loan.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        Loan updated = loanRepository.save(loan);
        auditService.log(currentUser(), "UPDATE", "Loan", "Returned loan id: " + loanId);
        return mapToDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LoanDTO> getAllLoans(Pageable pageable) {
        return loanRepository.findAll(pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public LoanDTO getLoanById(Long id) {
        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with id: " + id));
        return mapToDTO(loan);
    }

    private String currentUser() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "system";
        }
    }

    private LoanDTO mapToDTO(Loan loan) {
        return LoanDTO.builder()
                .id(loan.getId())
                .bookId(loan.getBook().getId())
                .bookTitle(loan.getBook().getTitle())
                .memberId(loan.getMember().getId())
                .memberName(loan.getMember().getFullName())
                .issueDate(loan.getIssueDate())
                .dueDate(loan.getDueDate())
                .returnDate(loan.getReturnDate())
                .status(loan.getStatus().name())
                .fineAmount(loan.getFineAmount())
                .build();
    }
}
