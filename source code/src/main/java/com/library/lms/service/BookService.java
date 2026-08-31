package com.library.lms.service;

import com.library.lms.dto.BookDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface BookService {
    BookDTO createBook(BookDTO dto);
    BookDTO updateBook(Long id, BookDTO dto);
    void deleteBook(Long id);
    BookDTO getBookById(Long id);
    Page<BookDTO> searchBooks(String title, Long categoryId, Long authorId, Boolean availableOnly, Pageable pageable);
    String uploadCoverImage(Long bookId, MultipartFile file);
}
