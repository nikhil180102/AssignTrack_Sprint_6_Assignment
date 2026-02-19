package com.assignment.controller;

import com.assignment.dto.*;
import com.assignment.service.student.StudentMcqService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/student/mcq")
@RequiredArgsConstructor
public class StudentMcqController {

    private final StudentMcqService studentMcqService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<McqAssignmentResponseDto>> getMcq(
            @PathVariable Long id,
            Authentication auth) {

        Long studentId = Long.valueOf(auth.getName());

        return ResponseEntity.ok(
                ApiResponse.success(
                        "MCQ assignment fetched successfully",
                        studentMcqService.getMcqAssignmentForStudent(id, studentId)
                ));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<McqSubmissionResponseDto>> submit(
            @PathVariable Long id,
            @Valid @RequestBody McqSubmissionRequest req,
            Authentication auth) {

        Long studentId = Long.valueOf(auth.getName());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "MCQ assignment submitted successfully",
                        studentMcqService.submitMcqAssignment(id, req, studentId)
                ));
    }

    @GetMapping("/{id}/result")
    public ResponseEntity<ApiResponse<McqSubmissionResponseDto>> getResult(
            @PathVariable Long id,
            Authentication auth) {

        Long studentId = Long.valueOf(auth.getName());

        return ResponseEntity.ok(
                ApiResponse.success(
                        "MCQ result fetched successfully",
                        studentMcqService.getMcqSubmissionResult(id, studentId)
                ));
    }
}
