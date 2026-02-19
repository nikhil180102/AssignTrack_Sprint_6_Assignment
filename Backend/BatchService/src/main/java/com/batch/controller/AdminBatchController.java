package com.batch.controller;

import com.batch.dto.*;
import com.batch.service.BatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/admin/batches")
@RequiredArgsConstructor
public class AdminBatchController {

    private final BatchService batchService;

    @PostMapping
    public ResponseEntity<ApiResponse<BatchResponseDto>> createBatch(
            @Valid @RequestBody CreateBatchRequest request) {
BatchResponseDto batch = batchService.createBatch(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Batch created successfully", batch));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BatchResponseDto>>> getAllBatches() {
List<BatchResponseDto> batches = batchService.getAllBatches();

        return ResponseEntity.ok(
                ApiResponse.success("Batches fetched successfully", batches));
    }

    @GetMapping("/{batchId}")
    public ResponseEntity<ApiResponse<BatchDetailsDto>> getBatchDetails(
            @PathVariable Long batchId) {
BatchDetailsDto details = batchService.getBatchDetails(batchId);

        return ResponseEntity.ok(
                ApiResponse.success("Batch details fetched successfully", details));
    }

    @PutMapping("/{batchId}/publish")
    public ResponseEntity<ApiResponse<Void>> publishBatch(@PathVariable Long batchId) {
batchService.publishBatch(batchId);

        return ResponseEntity.ok(
                ApiResponse.success("Batch published successfully", null));
    }

    @PutMapping("/{batchId}/close")
    public ResponseEntity<ApiResponse<Void>> closeBatch(@PathVariable Long batchId) {
batchService.closeBatch(batchId);

        return ResponseEntity.ok(
                ApiResponse.success("Batch closed successfully", null));
    }

    @PostMapping("/{batchId}/teachers")
    public ResponseEntity<ApiResponse<Void>> assignTeacher(
            @PathVariable Long batchId,
            @Valid @RequestBody AssignTeacherRequest request) {
batchService.assignTeacher(batchId, request.getTeacherId());

        return ResponseEntity.ok(
                ApiResponse.success("Teacher assigned successfully", null));
    }

    @GetMapping("/{batchId}/teachers")
    public ResponseEntity<ApiResponse<List<BatchTeacherDto>>> getBatchTeachers(
            @PathVariable Long batchId) {
List<BatchTeacherDto> teachers = batchService.getBatchTeachers(batchId);

        return ResponseEntity.ok(
                ApiResponse.success("Batch teachers fetched successfully", teachers));
    }

    @DeleteMapping("/{batchId}/teachers/{teacherId}")
    public ResponseEntity<ApiResponse<Void>> removeTeacher(
            @PathVariable Long batchId,
            @PathVariable Long teacherId) {
batchService.removeTeacherFromBatch(batchId, teacherId);

        return ResponseEntity.ok(
                ApiResponse.success("Teacher removed successfully", null));
    }

    @GetMapping("/{batchId}/contents")
    public ResponseEntity<ApiResponse<List<BatchContentDto>>> getBatchContents(
            @PathVariable Long batchId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("Batch contents fetched successfully", batchService.getBatchContents(batchId))
        );
    }

    @PutMapping("/{batchId}/contents/{contentId}")
    public ResponseEntity<ApiResponse<BatchContentDto>> updateBatchContent(
            @PathVariable Long batchId,
            @PathVariable Long contentId,
            @Valid @RequestBody BatchContentRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("Batch content updated successfully", batchService.updateBatchContent(batchId, contentId, request))
        );
    }

    @DeleteMapping("/{batchId}/contents/{contentId}")
    public ResponseEntity<ApiResponse<Void>> removeBatchContent(
            @PathVariable Long batchId,
            @PathVariable Long contentId
    ) {
        batchService.removeBatchContent(batchId, contentId);
        return ResponseEntity.ok(ApiResponse.success("Batch content removed successfully", null));
    }
}
