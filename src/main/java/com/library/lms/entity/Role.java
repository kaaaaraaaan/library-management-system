package com.library.lms.entity;

public enum Role {
    ADMIN,      // Full access - manage books, members, users, loans
    LIBRARIAN,  // Manage books, members, loans
    MEMBER      // View books, view own loans
}
