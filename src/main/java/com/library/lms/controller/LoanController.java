package com.library.lms.controller;

import com.library.lms.dto.ApiResponse;
import com.library.lms.dto.LoanDTO;
import com.library.lms.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @PostMapping("/issue")
    public ResponseEntity<ApiResponse<LoanDTO>> issue(@Valid @RequestBody LoanDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Book issued successfully", loanService.issueLoan(dto)));
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<ApiResponse<LoanDTO>> returnBook(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Book returned successfully", loanService.returnLoan(id)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LoanDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Loan fetched successfully", loanService.getLoanById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LoanDTO>>> getAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Loans fetched successfully", loanService.getAllLoans(pageable)));
    }
}
