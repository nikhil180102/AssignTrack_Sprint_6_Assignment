package com.user.service;

import com.user.entity.PasswordResetOtp;
import com.user.entity.User;
import com.user.dto.*;
import com.user.exception.*;
import com.user.exception.BadRequestException;
import com.user.exception.ResourceNotFoundException;
import com.user.repository.PasswordResetOtpRepository;
import com.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationPublisher notificationPublisher;

    public void requestOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String otp = generateOtp();

        PasswordResetOtp record = PasswordResetOtp.builder()
                .userId(user.getId())
                .otpHash(passwordEncoder.encode(otp))
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .build();

        otpRepository.save(record);

        boolean published = notificationPublisher.publish(
                new NotificationEvent(
                        user.getId(),
                        user.getEmail(),
                        user.getRole().name(),
                        "EMAIL",
                        "Your password reset OTP",
                        "Your OTP is: " + otp + ". It expires in 5 minutes."
                )
        );
        if (!published) {
            throw new NotificationUnavailableException(
                    "OTP created but email service is temporarily down."
            );
        }
    }

    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PasswordResetOtp record = otpRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId())
                .orElseThrow(() -> new BadRequestException("OTP not found"));

        if (Boolean.TRUE.equals(record.getUsed())) {
            throw new BadRequestException("OTP already used");
        }

        if (record.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP expired");
        }

        if (!passwordEncoder.matches(otp, record.getOtpHash())) {
            throw new BadRequestException("Invalid OTP");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        record.setUsed(true);
        otpRepository.save(record);
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
