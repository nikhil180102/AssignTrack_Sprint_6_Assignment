package com.user.controller;

import com.user.dto.ApiResponse;
import com.user.dto.UserResponseDto;
import com.user.entity.ApprovalStatus;
import com.user.exception.ResourceNotFoundException;
import com.user.repository.TeacherRepository;
import com.user.service.UserService;
import com.user.service.TeacherDocumentStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final TeacherRepository teacherRepository;
    private final TeacherDocumentStorageService teacherDocumentStorageService;

    @PutMapping("/teachers/{userId}/approve")
    public ResponseEntity<ApiResponse<String>> approveTeacher(
            @PathVariable Long userId) {

        userService.approveTeacher(userId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Teacher approved successfully",
                        "APPROVED"
                )
        );
    }
    @PutMapping("/teachers/{userId}/reject")
    public ResponseEntity<ApiResponse<String>> rejectTeacher(
            @PathVariable Long userId
    ) {
        userService.rejectTeacher(userId);
        return ResponseEntity.ok(
                ApiResponse.success("Teacher rejected successfully", "REJECTED")
        );
    }
    @GetMapping("/teachers")
    public ResponseEntity<ApiResponse<List<UserResponseDto>>> getTeachers(
            @RequestParam ApprovalStatus status
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Teachers fetched successfully",
                        userService.getTeachersByStatus(status)
                )
        );
    }

    @GetMapping("/teachers/{userId}/certification")
    public ResponseEntity<Resource> downloadTeacherCertification(@PathVariable Long userId) throws Exception {
        var teacher = teacherRepository.findByUser_Id(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));
        Path path = teacherDocumentStorageService.resolve(teacher.getCertificationFilePath());
        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists()) {
            throw new ResourceNotFoundException("Certification document not found");
        }
        String fileName = teacher.getCertificationFileName() == null
                ? path.getFileName().toString()
                : teacher.getCertificationFileName();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }
}
