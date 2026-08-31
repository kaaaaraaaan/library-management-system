package com.library.lms.controller;

import com.library.lms.dto.ApiResponse;
import com.library.lms.entity.Author;
import com.library.lms.exception.ResourceNotFoundException;
import com.library.lms.repository.AuthorRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authors")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuthorController {

    private final AuthorRepository authorRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<Author>> create(@Valid @RequestBody Author author) {
        return ResponseEntity.ok(ApiResponse.success("Author created successfully", authorRepository.save(author)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Author>> update(@PathVariable Long id, @Valid @RequestBody Author author) {
        Author existing = authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found with id: " + id));
        existing.setName(author.getName());
        existing.setBiography(author.getBiography());
        existing.setNationality(author.getNationality());
        return ResponseEntity.ok(ApiResponse.success("Author updated successfully", authorRepository.save(existing)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        authorRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Author deleted successfully", null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Author>> getById(@PathVariable Long id) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.success("Author fetched successfully", author));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Author>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Authors fetched successfully", authorRepository.findAll()));
    }
}
