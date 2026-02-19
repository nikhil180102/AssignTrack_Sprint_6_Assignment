package com.user.service;

import com.user.dto.*;
import com.user.entity.ApprovalStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {

    UserResponseDto getUserById(Long id);

    UserResponseDto createStudent(String email, String password, String firstName, String lastName);

    UserResponseDto registerTeacher(
            String email,
            String password,
            String firstName,
            String lastName,
            String expertise,
            Integer experienceYears,
            MultipartFile certificationFile
    );

    UserProfileDto getMyProfile(Long userId);

    UserProfileDto updateMyProfile(Long userId, com.user.dto.UpdateProfileRequest request);

    void changePassword(Long userId, com.user.dto.ChangePasswordRequest request);

    void approveTeacher(Long userId);

    void rejectTeacher(Long userId);

    List<UserResponseDto> getTeachersByStatus(ApprovalStatus status);

    UserProfileDto updateTeacherProfileWithDocument(
            Long userId,
            String firstName,
            String lastName,
            String expertise,
            Integer experienceYears,
            MultipartFile certificationFile
    );
}

