# Library Management System — Spring Boot (Advanced Java Programming, MCS-313)

A full-stack-ready **Spring Boot REST API** implementing a complete Library Management System,
built to satisfy the MCS-313 Advanced Java Programming final assignment requirements.

## Project Description
The system manages books, authors, categories, members, and loans (borrow/return) for a library.
It demonstrates layered architecture, Spring Data JPA, JWT-based authentication with
role-based access control, validation & exception handling, search/filter/sort/pagination,
and five additional advanced features.

## Features Implemented

### Core (Mandatory)
- Complete CRUD for Book, Author, Category, Member, and Loan entities.
- Layered architecture: Controller → Service → Repository → Entity.
- Spring Data JPA with H2 relational database (file-based, persists between restarts).
- Server-side validation (`jakarta.validation`) with a global exception handler
  returning structured, meaningful error responses.
- JWT-based authentication and role-based authorization (`ADMIN`, `LIBRARIAN`, `MEMBER`).
- Search, filtering, sorting, and pagination on Book, Member, and Loan endpoints
  using Spring Data `Specification` + `Pageable`.
- Well-documented REST API with consistent `ApiResponse<T>` envelope and interactive Swagger UI.

### Additional Features (5 implemented — exceeds the minimum of 3)
1. **File upload/download** — book cover image upload, served as a static resource.
2. **Scheduled tasks + email notification** — a daily cron job detects overdue loans,
   marks them `OVERDUE`, and sends (or logs, if mail is disabled) a reminder email to the member.
3. **PDF export** — generates a formatted PDF loans report using iText.
4. **CSV export** — generates a books inventory CSV report using OpenCSV.
5. **Audit logging** — every create/update/delete/login is persisted to an `audit_log`
   table (via a dedicated `AuditService`) and additionally logged through an AOP aspect
   (`AuditAspect`) that intercepts all service-layer write methods.

## Technology Stack
- Java 17, Spring Boot 3.2.5
- Spring Web, Spring Data JPA, Spring Security, Spring Validation, Spring AOP, Spring Mail
- H2 Database (file-based)
- JWT (io.jsonwebtoken)
- Springdoc OpenAPI (Swagger UI)
- iText (PDF), OpenCSV (CSV)
- Lombok, Maven

## Project Structure
```
src/main/java/com/library/lms/
├── entity/          Book, Author, Category, Member, Loan, User, Role, AuditLog
├── repository/      Spring Data JPA repositories (+ Specifications for dynamic search)
├── dto/             Request/response DTOs with validation annotations
├── service/         Service interfaces
├── service/impl/     Service implementations (business logic)
├── controller/      REST controllers
├── security/        JWT utilities, filter, UserDetailsService
├── config/          SecurityConfig, WebConfig, DataSeeder (sample data)
├── exception/       Custom exceptions + GlobalExceptionHandler
├── scheduler/       OverdueLoanScheduler (daily cron job)
└── aspect/          AuditAspect (AOP logging)
```

## Default Login Credentials
Seeded automatically on first run by `DataSeeder`:

| Username    | Password    | Role      |
|-------------|-------------|-----------|
| admin       | Admin@123   | ADMIN     |
| librarian   | Lib@1234    | LIBRARIAN |
| member      | Member@123  | MEMBER    |

## Software Requirements
- JDK 17+
- Apache Maven 3.8+
- No external DB required (uses embedded/file-based H2)

## How to Configure and Run

```bash
# 1. Extract the project and navigate into it
cd library-management-system

# 2. Build the project
mvn clean install

# 3. Run the application
mvn spring-boot:run
```

The API will start on **http://localhost:8080**.

- **Swagger UI (Interactive API Docs)**: `http://localhost:8080/swagger-ui.html`
- **H2 console**: `http://localhost:8080/h2-console`
  (JDBC URL: `jdbc:h2:file:./data/lmsdb`, user: `sa`, password: empty)
- **Login endpoint**: `POST /api/auth/login` with `{"username":"admin","password":"Admin@123"}`
  → copy the returned `token` and send it as `Authorization: Bearer <token>` on subsequent requests.

## Key API Endpoints

| Method | Endpoint                              | Description                              | Access            |
|--------|----------------------------------------|-------------------------------------------|-------------------|
| POST   | /api/auth/login                       | Login, returns JWT                        | Public            |
| POST   | /api/auth/register                    | Register a new user                       | Public            |
| GET    | /api/books?title=&categoryId=&page=   | Search/filter/sort/paginate books          | Public            |
| POST   | /api/books                            | Create book                                | ADMIN, LIBRARIAN  |
| PUT    | /api/books/{id}                       | Update book                                | ADMIN, LIBRARIAN  |
| DELETE | /api/books/{id}                       | Delete book                                | ADMIN             |
| POST   | /api/books/{id}/cover                 | Upload book cover image                    | ADMIN, LIBRARIAN  |
| GET    | /api/members                          | Search/filter/paginate members             | ADMIN, LIBRARIAN  |
| POST   | /api/loans/issue                      | Issue a book to a member                   | ADMIN, LIBRARIAN  |
| PUT    | /api/loans/{id}/return                | Return a book (auto-calculates fine)       | ADMIN, LIBRARIAN  |
| GET    | /api/reports/loans/pdf                | Download loans report as PDF               | ADMIN, LIBRARIAN  |
| GET    | /api/reports/books/csv                | Download books inventory as CSV            | ADMIN, LIBRARIAN  |
| GET    | /api/audit-logs                       | View audit trail                           | ADMIN             |

## Future Enhancements
- Angular/React frontend consuming the REST API.
- Redis caching for frequently searched books.
- Refresh-token rotation for JWT.
- Fine payment gateway integration.

## Author
Prepared for the Advanced Java Programming (MCS-313) Final Assignment.
