package com.library.lms.service.impl;

import com.library.lms.entity.AuditLog;
import com.library.lms.repository.AuditLogRepository;
import com.library.lms.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    @Override
    public void log(String username, String action, String entityName, String details) {
        AuditLog log = AuditLog.builder()
                .username(username)
                .action(action)
                .entityName(entityName)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }
}
