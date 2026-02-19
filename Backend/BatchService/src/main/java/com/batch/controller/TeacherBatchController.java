package com.batch.controller;

import com.batch.dto.ApiResponse;
import com.batch.dto.BatchDetailsDto;
import com.batch.dto.BatchContentDto;
import com.batch.dto.BatchContentRequest;
import com.batch.dto.BatchTeacherDto;
import com.batch.service.TeacherBatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/batches/teacher")
@RequiredArgsConstructor
public class TeacherBatchController {

    private final TeacherBatchService teacherBatchService;

    @GetMapping("/my")
    public ApiResponse<List<BatchTeacherDto>> myBatches(Authentication authentication) {
        try {
            if (authentication == null) {
                log.error("Authentication is null");
                return ApiResponse.failure("Authentication required");
            }

            Long teacherId = Long.parseLong(authentication.getName());
List<BatchTeacherDto> batches = teacherBatchService.getMyBatches(teacherId);
return ApiResponse.success("Teacher batches retrieved", batches);
        } catch (NumberFormatException e) {
            log.error("Invalid user ID format in authentication", e);
            return ApiResponse.failure("Invalid authentication data");
        } catch (Exception e) {
            log.error("Error fetching teacher batches", e);
            return ApiResponse.failure("Failed to fetch batches: " + e.getMessage());
        }
    }

    @GetMapping("/{batchId}")
    public ApiResponse<BatchDetailsDto> getBatchDetails(
            @PathVariable Long batchId,
            Authentication authentication
    ) {
        if (authentication == null) {
            return ApiResponse.failure("Authentication required");
        }

        Long teacherId;
        try {
            teacherId = Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            return ApiResponse.failure("Invalid authentication data");
        }

        BatchDetailsDto details =
                teacherBatchService.getBatchDetailsForTeacher(batchId, teacherId);

        return ApiResponse.success("Batch details fetched", details);
    }

    @GetMapping("/{batchId}/contents")
    public ApiResponse<List<BatchContentDto>> getBatchContents(
            @PathVariable Long batchId,
            Authentication authentication
    ) {
        if (authentication == null) {
            return ApiResponse.failure("Authentication required");
        }
        Long teacherId = Long.parseLong(authentication.getName());
        return ApiResponse.success(
                "Batch contents fetched",
                teacherBatchService.getBatchContents(batchId, teacherId)
        );
    }

    @PostMapping("/{batchId}/contents")
    public ResponseEntity<ApiResponse<BatchContentDto>> addBatchContent(
            @PathVariable Long batchId,
            @Valid @RequestBody BatchContentRequest request,
            Authentication authentication
    ) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.failure("Authentication required"));
        }
        Long teacherId = Long.parseLong(authentication.getName());
        BatchContentDto dto = teacherBatchService.addBatchContent(batchId, teacherId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Batch content added", dto));
    }

    @PutMapping("/{batchId}/contents/{contentId}")
    public ApiResponse<BatchContentDto> updateBatchContent(
            @PathVariable Long batchId,
            @PathVariable Long contentId,
            @Valid @RequestBody BatchContentRequest request,
            Authentication authentication
    ) {
        if (authentication == null) {
            return ApiResponse.failure("Authentication required");
        }
        Long teacherId = Long.parseLong(authentication.getName());
        return ApiResponse.success(
                "Batch content updated",
                teacherBatchService.updateBatchContent(batchId, contentId, teacherId, request)
        );
    }

    @DeleteMapping("/{batchId}/contents/{contentId}")
    public ApiResponse<Void> removeBatchContent(
            @PathVariable Long batchId,
            @PathVariable Long contentId,
            Authentication authentication
    ) {
        if (authentication == null) {
            return ApiResponse.failure("Authentication required");
        }
        Long teacherId = Long.parseLong(authentication.getName());
        teacherBatchService.removeBatchContent(batchId, contentId, teacherId);
        return ApiResponse.success("Batch content removed", null);
    }

}

