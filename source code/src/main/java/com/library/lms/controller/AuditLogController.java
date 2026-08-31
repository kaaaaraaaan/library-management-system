package com.library.lms.controller;

import com.library.lms.dto.ApiResponse;
import com.library.lms.entity.AuditLog;
import com.library.lms.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Audit logs fetched successfully", auditLogRepository.findAll(pageable)));
    }
}
