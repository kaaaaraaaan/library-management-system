package com.library.lms.service;

import com.library.lms.dto.LoanDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LoanService {
    LoanDTO issueLoan(LoanDTO dto);
    LoanDTO returnLoan(Long loanId);
    Page<LoanDTO> getAllLoans(Pageable pageable);
    LoanDTO getLoanById(Long id);
}
