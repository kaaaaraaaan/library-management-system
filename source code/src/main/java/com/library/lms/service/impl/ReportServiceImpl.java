package com.library.lms.service.impl;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.library.lms.entity.Book;
import com.library.lms.entity.Loan;
import com.library.lms.repository.BookRepository;
import com.library.lms.repository.LoanRepository;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements com.library.lms.service.ReportService {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;

    @Override
    public ByteArrayOutputStream generateLoansPdfReport() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Library Management System - Loans Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            String[] headers = {"Loan ID", "Book", "Member", "Issue Date", "Due Date", "Status"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11)));
                table.addCell(cell);
            }

            List<Loan> loans = loanRepository.findAll();
            for (Loan loan : loans) {
                table.addCell(String.valueOf(loan.getId()));
                table.addCell(loan.getBook().getTitle());
                table.addCell(loan.getMember().getFullName());
                table.addCell(String.valueOf(loan.getIssueDate()));
                table.addCell(String.valueOf(loan.getDueDate()));
                table.addCell(loan.getStatus().name());
            }
            document.add(table);
            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate PDF report: " + e.getMessage());
        }
        return out;
    }

    @Override
    public ByteArrayOutputStream generateBooksCsvReport() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(out))) {
            writer.writeNext(new String[]{"ID", "Title", "ISBN", "Author", "Category", "Total Copies", "Available Copies"});
            List<Book> books = bookRepository.findAll();
            for (Book book : books) {
                writer.writeNext(new String[]{
                        String.valueOf(book.getId()),
                        book.getTitle(),
                        book.getIsbn(),
                        book.getAuthor() != null ? book.getAuthor().getName() : "",
                        book.getCategory() != null ? book.getCategory().getName() : "",
                        String.valueOf(book.getTotalCopies()),
                        String.valueOf(book.getAvailableCopies())
                });
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate CSV report: " + e.getMessage());
        }
        return out;
    }
}
