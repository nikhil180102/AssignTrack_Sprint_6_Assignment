package com.assignment.controller;

import com.assignment.dto.*;
import com.assignment.service.student.StudentAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
@Slf4j
@RestController
@RequestMapping("/student/assignment")
@RequiredArgsConstructor
public class StudentAssignmentController {

    private final StudentAssignmentService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StudentAssignmentDto>>> list(
            Authentication auth) {

        List<StudentAssignmentDto> data =
                service.listAssignments(Long.valueOf(auth.getName()));

        return ResponseEntity.ok(
                ApiResponse.success("Assignments fetched successfully", data)
        );
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<Void>> submit(
            @PathVariable Long id,
            @RequestBody AssignmentSubmitRequest req,
            Authentication auth) {

        service.submitAssignment(
                id, req, Long.valueOf(auth.getName()));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Assignment submitted successfully", null));
    }

    @PostMapping(value = "/{id}/submit-file", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<Void>> submitFile(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file,
            Authentication auth) {

        service.submitFileAssignment(
                id, file, Long.valueOf(auth.getName()));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "File assignment submitted successfully", null));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Void>> refreshAssignmentsCache(
            Authentication auth) {
        service.evictStudentAssignments(Long.valueOf(auth.getName()));
        return ResponseEntity.ok(
                ApiResponse.success("Assignments cache refreshed", null)
        );
    }

}
