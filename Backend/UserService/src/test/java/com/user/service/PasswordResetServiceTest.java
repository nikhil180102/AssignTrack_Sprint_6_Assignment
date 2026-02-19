package com.user.service;

import com.user.entity.PasswordResetOtp;
import com.user.entity.Role;
import com.user.entity.User;
import com.user.exception.BadRequestException;
import com.user.exception.NotificationUnavailableException;
import com.user.exception.ResourceNotFoundException;
import com.user.repository.PasswordResetOtpRepository;
import com.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordResetOtpRepository otpRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private NotificationPublisher notificationPublisher;

    @InjectMocks
    private PasswordResetService passwordResetService;

    private User user;

    @BeforeEach
    void setup() {
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setRole(Role.STUDENT);
        user.setPasswordHash("oldEncoded");
    }

    @Test
    void requestOtp_success() {
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.encode(any()))
                .thenReturn("encodedOtp");

        when(notificationPublisher.publish(any()))
                .thenReturn(true);

        passwordResetService.requestOtp("test@example.com");

        verify(otpRepository).save(any(PasswordResetOtp.class));
        verify(notificationPublisher).publish(any());
    }

    @Test
    void requestOtp_userNotFound() {
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> passwordResetService.requestOtp("test@example.com"));
    }

    @Test
    void requestOtp_notificationFails() {
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.encode(any()))
                .thenReturn("encodedOtp");

        when(notificationPublisher.publish(any()))
                .thenReturn(false);

        assertThrows(NotificationUnavailableException.class,
                () -> passwordResetService.requestOtp("test@example.com"));
    }

    @Test
    void resetPassword_success() {
        PasswordResetOtp record = PasswordResetOtp.builder()
                .userId(1L)
                .otpHash("encodedOtp")
                .createdAt(LocalDateTime.now().minusMinutes(1))
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .build();

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(otpRepository.findFirstByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(Optional.of(record));

        when(passwordEncoder.matches("123456", "encodedOtp"))
                .thenReturn(true);

        when(passwordEncoder.encode("newPass"))
                .thenReturn("encodedNew");

        passwordResetService.resetPassword("test@example.com", "123456", "newPass");

        assertTrue(record.getUsed());
        assertEquals("encodedNew", user.getPasswordHash());

        verify(userRepository).save(user);
        verify(otpRepository).save(record);
    }

    @Test
    void resetPassword_userNotFound() {
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> passwordResetService.resetPassword(
                        "test@example.com", "123456", "newPass"));
    }

    @Test
    void resetPassword_otpNotFound() {
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(otpRepository.findFirstByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(Optional.empty());

        assertThrows(BadRequestException.class,
                () -> passwordResetService.resetPassword(
                        "test@example.com", "123456", "newPass"));
    }

    @Test
    void resetPassword_otpAlreadyUsed() {
        PasswordResetOtp record = PasswordResetOtp.builder()
                .userId(1L)
                .otpHash("encodedOtp")
                .createdAt(LocalDateTime.now().minusMinutes(1))
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .used(true)
                .build();

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(otpRepository.findFirstByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(Optional.of(record));

        assertThrows(BadRequestException.class,
                () -> passwordResetService.resetPassword(
                        "test@example.com", "123456", "newPass"));
    }

    @Test
    void resetPassword_otpExpired() {
        PasswordResetOtp record = PasswordResetOtp.builder()
                .userId(1L)
                .otpHash("encodedOtp")
                .createdAt(LocalDateTime.now().minusMinutes(10))
                .expiresAt(LocalDateTime.now().minusMinutes(1))
                .used(false)
                .build();

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(otpRepository.findFirstByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(Optional.of(record));

        assertThrows(BadRequestException.class,
                () -> passwordResetService.resetPassword(
                        "test@example.com", "123456", "newPass"));
    }

    @Test
    void resetPassword_invalidOtp() {
        PasswordResetOtp record = PasswordResetOtp.builder()
                .userId(1L)
                .otpHash("encodedOtp")
                .createdAt(LocalDateTime.now().minusMinutes(1))
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .build();

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(otpRepository.findFirstByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(Optional.of(record));

        when(passwordEncoder.matches("wrongOtp", "encodedOtp"))
                .thenReturn(false);

        assertThrows(BadRequestException.class,
                () -> passwordResetService.resetPassword(
                        "test@example.com", "wrongOtp", "newPass"));
    }
}
