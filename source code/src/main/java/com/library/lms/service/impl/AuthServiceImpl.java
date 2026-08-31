package com.library.lms.service.impl;

import com.library.lms.dto.AuthRequest;
import com.library.lms.dto.AuthResponse;
import com.library.lms.dto.RegisterRequest;
import com.library.lms.entity.Role;
import com.library.lms.entity.User;
import com.library.lms.exception.BadRequestException;
import com.library.lms.repository.UserRepository;
import com.library.lms.security.JwtUtil;
import com.library.lms.service.AuditService;
import com.library.lms.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuditService auditService;

    @Override
    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPassword(), true, true, true, true, java.util.List.of());

        String token = jwtUtil.generateToken(userDetails, user.getRole().name());
        auditService.log(user.getUsername(), "LOGIN", "User", "User logged in");

        return AuthResponse.builder().token(token).username(user.getUsername()).role(user.getRole().name()).build();
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        Role role;
        try {
            role = request.getRole() != null ? Role.valueOf(request.getRole().toUpperCase()) : Role.MEMBER;
        } catch (IllegalArgumentException e) {
            role = Role.MEMBER;
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .enabled(true)
                .build();
        userRepository.save(user);
        auditService.log(user.getUsername(), "CREATE", "User", "New user registered with role " + role);

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPassword(), true, true, true, true, java.util.List.of());
        String token = jwtUtil.generateToken(userDetails, role.name());
        return AuthResponse.builder().token(token).username(user.getUsername()).role(role.name()).build();
    }
}
