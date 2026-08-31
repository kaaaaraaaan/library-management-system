package com.library.lms.service;

import java.io.ByteArrayOutputStream;

public interface ReportService {
    ByteArrayOutputStream generateLoansPdfReport();
    ByteArrayOutputStream generateBooksCsvReport();
}
