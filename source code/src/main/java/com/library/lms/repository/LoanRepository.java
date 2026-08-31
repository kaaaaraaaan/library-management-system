package com.library.lms.repository;

import com.library.lms.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long>, JpaSpecificationExecutor<Loan> {

    @Query("SELECT l FROM Loan l WHERE l.status = 'ISSUED' AND l.dueDate < :today")
    List<Loan> findOverdueLoans(LocalDate today);

    List<Loan> findByMemberId(Long memberId);
}
