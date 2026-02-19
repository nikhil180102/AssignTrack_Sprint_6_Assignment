package com.assignment.controller;

import com.assignment.dto.ApiResponse;
import com.assignment.dto.McqAssignmentCreateRequest;
import com.assignment.dto.McqAssignmentResponseDto;
import com.assignment.dto.McqSubmissionResponseDto;
import com.assignment.dto.McqSubmissionSummaryDto;
import com.assignment.dto.McqAssignmentUpdateRequest;
import com.assignment.service.teacher.TeacherMcqAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/teacher/mcq-assignments")
@RequiredArgsConstructor
public class TeacherMcqAssignmentController {

    private final TeacherMcqAssignmentService teacherMcqAssignmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<McqAssignmentResponseDto>> create(
            @Valid @RequestBody McqAssignmentCreateRequest request, Authentication auth) {

        Long teacherId = Long.valueOf(auth.getName());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "MCQ assignment created",
                        teacherMcqAssignmentService.createMcqAssignment(request, teacherId)
                ));
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<Void>> publish(@PathVariable Long id, Authentication auth) {

        teacherMcqAssignmentService.publishMcqAssignment(id, Long.valueOf(auth.getName()));
        return ResponseEntity.ok(ApiResponse.success("Published", null));
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<ApiResponse<Void>> close(
            @PathVariable Long id,
            Authentication auth) {

        teacherMcqAssignmentService.closeMcqAssignment(id, Long.valueOf(auth.getName()));
        return ResponseEntity.ok(ApiResponse.success("Closed", null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<McqAssignmentResponseDto>> get(
            @PathVariable Long id,
            Authentication auth) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Fetched",
                        teacherMcqAssignmentService.getMcqAssignment(id, Long.valueOf(auth.getName()))
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<McqAssignmentResponseDto>> update(
            @PathVariable Long id,
            @RequestBody McqAssignmentUpdateRequest request,
            Authentication auth) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Updated",
                        teacherMcqAssignmentService.updateMcqAssignment(
                                id, request, Long.valueOf(auth.getName()))
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            Authentication auth) {

        teacherMcqAssignmentService.deleteMcqAssignment(id, Long.valueOf(auth.getName()));
        return ResponseEntity.ok(ApiResponse.success("Deleted", null));
    }

    @GetMapping("/{id}/submissions")
    public ResponseEntity<ApiResponse<java.util.List<McqSubmissionSummaryDto>>> submissions(
            @PathVariable Long id,
            Authentication auth) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Submissions fetched",
                        teacherMcqAssignmentService.getMcqSubmissions(id, Long.valueOf(auth.getName()))
                )
        );
    }

}

