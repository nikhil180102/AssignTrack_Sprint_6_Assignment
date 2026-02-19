package com.batch.controller;

import com.batch.dto.ApiResponse;
import com.batch.dto.BatchContentDto;
import com.batch.dto.BatchResponseDto;
import com.batch.service.StudentBatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/batches/student")
@RequiredArgsConstructor
public class StudentBatchController {

    private final StudentBatchService studentBatchService;

    @GetMapping("/available")
    public ApiResponse<List<BatchResponseDto>> availableBatches() {
        try {
List<BatchResponseDto> batches = studentBatchService.listPublishedBatches();
            return ApiResponse.success("Published batches", batches);
        } catch (Exception e) {
            log.error("Error fetching available batches", e);
            return ApiResponse.failure("Failed to fetch batches: " + e.getMessage());
        }
    }

    @PostMapping("/{batchId}/enroll")
    public ApiResponse<Void> enroll(
            @PathVariable Long batchId,
            Authentication authentication) {
        try {
            if (authentication == null) {
                log.error("Authentication is null");
                return ApiResponse.failure("Authentication required");
            }

            Long studentId = Long.parseLong(authentication.getName());
studentBatchService.enroll(batchId, studentId);
            return ApiResponse.success("Enrolled successfully", null);
        } catch (NumberFormatException e) {
            log.error("Invalid user ID format in authentication", e);
            return ApiResponse.failure("Invalid authentication data");
        } catch (Exception e) {
            log.error("Error enrolling student", e);
            return ApiResponse.failure("Enrollment failed: " + e.getMessage());
        }
    }

    @GetMapping("/my")
    public ApiResponse<List<BatchResponseDto>> myBatches(Authentication authentication) {
        try {
            if (authentication == null) {
                log.error("Authentication is null");
                return ApiResponse.failure("Authentication required");
            }

            Long studentId = Long.parseLong(authentication.getName());
List<BatchResponseDto> batches = studentBatchService.myBatches(studentId);
            return ApiResponse.success("My batches", batches);
        } catch (NumberFormatException e) {
            log.error("Invalid user ID format in authentication", e);
            return ApiResponse.failure("Invalid authentication data");
        } catch (Exception e) {
            log.error("Error fetching student batches", e);
            return ApiResponse.failure("Failed to fetch batches: " + e.getMessage());
        }
    }

    @GetMapping("/{batchId}/contents")
    public ApiResponse<List<BatchContentDto>> getBatchContents(
            @PathVariable Long batchId,
            Authentication authentication
    ) {
        try {
            Long studentId = Long.parseLong(authentication.getName());
            return ApiResponse.success(
                    "Batch contents fetched successfully",
                    studentBatchService.getBatchContentsForStudent(batchId, studentId)
            );
        } catch (Exception e) {
            log.error("Error fetching batch contents", e);
            return ApiResponse.failure("Failed to fetch batch contents: " + e.getMessage());
        }
    }

    @PostMapping("/{batchId}/contents/{contentId}/complete")
    public ApiResponse<Void> markContentComplete(
            @PathVariable Long batchId,
            @PathVariable Long contentId,
            Authentication authentication
    ) {
        try {
            Long studentId = Long.parseLong(authentication.getName());
            studentBatchService.markContentCompleted(batchId, contentId, studentId);
            return ApiResponse.success("Content marked complete", null);
        } catch (Exception e) {
            log.error("Error marking content complete", e);
            return ApiResponse.failure("Failed to mark content complete: " + e.getMessage());
        }
    }

    @DeleteMapping("/{batchId}/contents/{contentId}/complete")
    public ApiResponse<Void> unmarkContentComplete(
            @PathVariable Long batchId,
            @PathVariable Long contentId,
            Authentication authentication
    ) {
        try {
            Long studentId = Long.parseLong(authentication.getName());
            studentBatchService.unmarkContentCompleted(batchId, contentId, studentId);
            return ApiResponse.success("Content marked incomplete", null);
        } catch (Exception e) {
            log.error("Error marking content incomplete", e);
            return ApiResponse.failure("Failed to mark content incomplete: " + e.getMessage());
        }
    }
}
