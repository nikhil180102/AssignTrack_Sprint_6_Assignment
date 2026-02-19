package com.user.controller;

import com.user.dto.ApiResponse;
import com.user.dto.ChangePasswordRequest;
import com.user.dto.RegisterUserRequest;
import com.user.dto.UpdateProfileRequest;
import com.user.dto.UserProfileDto;
import com.user.dto.UserResponseDto;
import com.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor

public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserById(
            @PathVariable Long id) {

        UserResponseDto dto = userService.getUserById(id);

        return ResponseEntity.ok(
                ApiResponse.success("User fetched successfully", dto)
        );
    }

    @PostMapping("/students")
    public ResponseEntity<ApiResponse<UserResponseDto>> createStudent(
            @Valid @RequestBody RegisterUserRequest request) {

        UserResponseDto dto = userService.createStudent(request.getEmail(), request.getPassword(),
                request.getFirstName(), request.getLastName());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student registered", dto));
    }
    @PostMapping(value = "/register/teacher", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<UserResponseDto>> registerTeacher(
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam String expertise,
            @RequestParam Integer experienceYears,
            @RequestPart("certificationFile") MultipartFile certificationFile) {

        UserResponseDto dto = userService.registerTeacher(
                email,
                password,
                firstName,
                lastName,
                expertise,
                experienceYears,
                certificationFile
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Teacher registered. Waiting for admin approval",
                        dto
                ));
    }
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> myProfile(
            Authentication auth) {

        UserProfileDto dto =
                userService.getMyProfile(Long.valueOf(auth.getName()));

        return ResponseEntity.ok(
                ApiResponse.success("Profile fetched successfully", dto)
        );
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication auth) {

        UserProfileDto dto =
                userService.updateMyProfile(Long.valueOf(auth.getName()), request);

        return ResponseEntity.ok(
                ApiResponse.success("Profile updated successfully", dto)
        );
    }

    @PutMapping(value = "/profile/teacher", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateTeacherProfile(
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String expertise,
            @RequestParam(required = false) Integer experienceYears,
            @RequestPart(value = "certificationFile", required = false) MultipartFile certificationFile,
            Authentication auth
    ) {
        UserProfileDto dto = userService.updateTeacherProfileWithDocument(
                Long.valueOf(auth.getName()),
                firstName,
                lastName,
                expertise,
                experienceYears,
                certificationFile
        );

        return ResponseEntity.ok(
                ApiResponse.success("Teacher profile updated successfully", dto)
        );
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication auth) {

        userService.changePassword(Long.valueOf(auth.getName()), request);
        return ResponseEntity.ok(
                ApiResponse.success("Password updated successfully", "UPDATED")
        );
    }

}
