package com.library.lms.service;

public interface AuditService {
    void log(String username, String action, String entityName, String details);
}
