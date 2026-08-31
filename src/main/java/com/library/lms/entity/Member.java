package com.library.lms.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "member")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank
    @Email(message = "Valid email is required")
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank
    @Pattern(regexp = "^[0-9+\\-\\s]{7,15}$", message = "Invalid phone number")
    private String phone;

    private String address;

    private LocalDate membershipDate;

    @Enumerated(EnumType.STRING)
    private MemberStatus status;

    public enum MemberStatus { ACTIVE, SUSPENDED, INACTIVE }

    @PrePersist
    public void prePersist() {
        if (membershipDate == null) membershipDate = LocalDate.now();
        if (status == null) status = MemberStatus.ACTIVE;
    }
}
