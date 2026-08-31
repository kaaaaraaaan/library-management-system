package com.library.lms.controller;

import com.library.lms.dto.ApiResponse;
import com.library.lms.dto.BookDTO;
import com.library.lms.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @PostMapping
    public ResponseEntity<ApiResponse<BookDTO>> create(@Valid @RequestBody BookDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Book created successfully", bookService.createBook(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookDTO>> update(@PathVariable Long id, @Valid @RequestBody BookDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Book updated successfully", bookService.updateBook(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok(ApiResponse.success("Book deleted successfully", null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Book fetched successfully", bookService.getBookById(id)));
    }

    // Search + filter + sort + pagination:
    // GET /api/books?title=1984&categoryId=1&authorId=1&availableOnly=true&page=0&size=10&sort=title,asc
    @GetMapping
    public ResponseEntity<ApiResponse<Page<BookDTO>>> search(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long authorId,
            @RequestParam(required = false) Boolean availableOnly,
            Pageable pageable) {
        Page<BookDTO> result = bookService.searchBooks(title, categoryId, authorId, availableOnly, pageable);
        return ResponseEntity.ok(ApiResponse.success("Books fetched successfully", result));
    }

    @PostMapping("/{id}/cover")
    public ResponseEntity<ApiResponse<String>> uploadCover(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        String path = bookService.uploadCoverImage(id, file);
        return ResponseEntity.ok(ApiResponse.success("Cover image uploaded successfully", path));
    }
}
