package com.library.lms.controller;

import com.library.lms.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/loans/pdf")
    public ResponseEntity<byte[]> loansReportPdf() {
        byte[] pdf = reportService.generateLoansPdfReport().toByteArray();
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=loans_report.pdf");
        return ResponseEntity.ok().headers(headers).contentType(MediaType.APPLICATION_PDF).body(pdf);
    }

    @GetMapping("/books/csv")
    public ResponseEntity<byte[]> booksReportCsv() {
        byte[] csv = reportService.generateBooksCsvReport().toByteArray();
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=books_report.csv");
        return ResponseEntity.ok().headers(headers).contentType(MediaType.parseMediaType("text/csv")).body(csv);
    }
}
