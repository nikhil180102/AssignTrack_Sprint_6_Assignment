package com.user.controller;

import com.user.dto.ApiResponse;
import com.user.dto.ForgotPasswordRequest;
import com.user.dto.LoginRequest;
import com.user.dto.LoginResponse;
import com.user.dto.ResetPasswordRequest;
import com.user.security.JwtUtil;
import com.user.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import com.user.entity.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;  //functional interface
    private final JwtUtil jwtUtil;
    private final PasswordResetService passwordResetService;

        @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body(
                    ApiResponse.failure("Invalid email or password", null)
            );
        }

        User user = (User) authentication.getPrincipal();

        if (user.getRole() == Role.TEACHER) {
            if (user.getApprovalStatus() == ApprovalStatus.PENDING) {
                return ResponseEntity.status(403).body(
                        ApiResponse.failure("Need admin approval to log in. Check your email for updates.", null)
                );
            }
            if (user.getApprovalStatus() == ApprovalStatus.REJECTED) {
                return ResponseEntity.status(403).body(
                        ApiResponse.failure("Your teacher account was rejected. Check your email for details.", null)
                );
            }
        }

        if (!user.isEnabled()) {
            return ResponseEntity.status(403).body(
                    ApiResponse.failure("Account is inactive. Contact admin.", null)
            );
        }

        String token = jwtUtil.generateToken(user);
        String role = user.getRole().name();
        LoginResponse response = new LoginResponse(token, role);

        return ResponseEntity.ok(
                ApiResponse.success("Login successful", response)
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(
            @RequestBody ForgotPasswordRequest request) {

        try {
            passwordResetService.requestOtp(request.getEmail());
            return ResponseEntity.ok(
                    ApiResponse.success("OTP created. Email will be sent shortly.", "OTP_SENT")
            );
        } catch (com.user.exception.NotificationUnavailableException ex) {
            return ResponseEntity.ok(
                    ApiResponse.success(ex.getMessage(), "OTP_CREATED_EMAIL_FAILED")
            );
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        passwordResetService.resetPassword(
                request.getEmail(), request.getOtp(), request.getNewPassword());

        return ResponseEntity.ok(
                ApiResponse.success("Password reset successful", "PASSWORD_RESET")
        );
    }
}
