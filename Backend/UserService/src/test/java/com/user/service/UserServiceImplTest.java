package com.user.service;

import com.user.dto.ChangePasswordRequest;
import com.user.dto.UpdateProfileRequest;
import com.user.dto.UserProfileDto;
import com.user.dto.UserResponseDto;
import com.user.entity.*;
import com.user.exception.ResourceNotFoundException;
import com.user.repository.StudentRepository;
import com.user.repository.TeacherRepository;
import com.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class UserServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private StudentRepository studentRepository;
    @Mock private TeacherRepository teacherRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private ModelMapper modelMapper;
    @Mock private NotificationPublisher notificationPublisher;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;

    @BeforeEach
    void setup() {
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setPasswordHash("encodedOldPassword");
        user.setRole(Role.STUDENT);
        user.setActive(true);
    }

    @Test
    void getUserById_success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(modelMapper.map(user, UserResponseDto.class)).thenReturn(new UserResponseDto());

        UserResponseDto response = userService.getUserById(1L);

        assertNotNull(response);
        verify(userRepository).findById(1L);
    }

    @Test
    void getUserById_notFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> userService.getUserById(1L));
    }

    @Test
    void createStudent_success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("1234")).thenReturn("encoded1234");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(modelMapper.map(any(), eq(UserResponseDto.class))).thenReturn(new UserResponseDto());

        UserResponseDto response = userService.createStudent(
                "test@example.com", "1234", "John", "Doe");

        assertNotNull(response);
        verify(studentRepository).save(any(Student.class));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createStudent_emailExists() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class,
                () -> userService.createStudent(
                        "test@example.com", "1234", "John", "Doe"));
    }

    @Test
    void changePassword_success() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("old");
        request.setNewPassword("new");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old", "encodedOldPassword")).thenReturn(true);
        when(passwordEncoder.encode("new")).thenReturn("encodedNew");

        userService.changePassword(1L, request);

        verify(userRepository).save(user);
        assertEquals("encodedNew", user.getPasswordHash());
    }

    @Test
    void changePassword_wrongOldPassword() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("wrong");
        request.setNewPassword("new");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encodedOldPassword")).thenReturn(false);

        assertThrows(IllegalArgumentException.class,
                () -> userService.changePassword(1L, request));
    }

    @Test
    void approveTeacher_success() {
        user.setRole(Role.TEACHER);
        user.setApprovalStatus(ApprovalStatus.PENDING);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationPublisher.publish(any())).thenReturn(true);

        userService.approveTeacher(1L);

        assertEquals(ApprovalStatus.APPROVED, user.getApprovalStatus());
        verify(notificationPublisher).publish(any());
        verify(userRepository).save(user);
    }

    @Test
    void approveTeacher_notTeacher() {
        user.setRole(Role.STUDENT);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class,
                () -> userService.approveTeacher(1L));
    }

    @Test
    void rejectTeacher_success() {
        user.setRole(Role.TEACHER);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationPublisher.publish(any())).thenReturn(true);

        userService.rejectTeacher(1L);

        assertEquals(ApprovalStatus.REJECTED, user.getApprovalStatus());
        verify(notificationPublisher).publish(any());
    }

    @Test
    void getTeachersByStatus_success() {
        user.setRole(Role.TEACHER);
        user.setApprovalStatus(ApprovalStatus.APPROVED);

        when(userRepository.findByRoleAndApprovalStatus(Role.TEACHER, ApprovalStatus.APPROVED))
                .thenReturn(List.of(user));

        when(modelMapper.map(any(), eq(UserResponseDto.class)))
                .thenReturn(new UserResponseDto());

        List<UserResponseDto> result =
                userService.getTeachersByStatus(ApprovalStatus.APPROVED);

        assertEquals(1, result.size());
    }
}
