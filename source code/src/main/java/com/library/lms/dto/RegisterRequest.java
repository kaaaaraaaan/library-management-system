package com.library.lms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {
    @NotBlank
    private String username;
    @NotBlank @Email
    private String email;
    @NotBlank
    private String password;
    private String role; // ADMIN, LIBRARIAN, MEMBER
}
