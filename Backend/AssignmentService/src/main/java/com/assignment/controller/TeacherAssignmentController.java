package com.assignment.controller;

import com.assignment.dto.*;
import com.assignment.entity.AssignmentStatus;
import com.assignment.entity.AssignmentType;
import com.assignment.service.teacher.TeacherTextAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;

import java.util.List;

@RestController
@RequestMapping("/teacher/assignment")
@RequiredArgsConstructor
public class TeacherAssignmentController {

    private final TeacherTextAssignmentService service;

    @PostMapping
    public ResponseEntity<ApiResponse<AssignmentResponseDto>> create(
            @RequestBody AssignmentCreateRequest req,
            Authentication auth) {

        AssignmentResponseDto data =
                service.createAssignment(
                        req, Long.valueOf(auth.getName()));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Assignment created successfully", data));
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<Void>> publish(@PathVariable Long id, Authentication auth) {

        service.publishAssignment(
                    id, Long.valueOf(auth.getName()));

        return ResponseEntity.ok(
                ApiResponse.success("Assignment published successfully", null));
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<ApiResponse<Void>> close(
            @PathVariable Long id,
            Authentication auth) {

        service.closeAssignment(
                id, Long.valueOf(auth.getName()));

        return ResponseEntity.ok(
                ApiResponse.success("Assignment closed successfully", null));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<AssignmentResponseDto>>> my(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) AssignmentType type,
            @RequestParam(required = false) AssignmentStatus status) {

        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 50),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<AssignmentResponseDto> data = service.myAssignments(
                Long.valueOf(auth.getName()),
                search,
                type,
                status,
                pageable
        );

        return ResponseEntity.ok(
                ApiResponse.success("My assignments fetched successfully", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssignmentResponseDto>> get(
            @PathVariable Long id,
            Authentication auth) {

        AssignmentResponseDto data =
                service.getAssignment(id, Long.valueOf(auth.getName()));

        return ResponseEntity.ok(
                ApiResponse.success("Assignment fetched successfully", data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AssignmentResponseDto>> update(
            @PathVariable Long id,
            @RequestBody AssignmentUpdateRequest request,
            Authentication auth) {

        AssignmentResponseDto data =
                service.updateAssignment(id, request, Long.valueOf(auth.getName()));

        return ResponseEntity.ok(
                ApiResponse.success("Assignment updated successfully", data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            Authentication auth) {

        service.deleteAssignment(id, Long.valueOf(auth.getName()));

        return ResponseEntity.ok(
                ApiResponse.success("Assignment deleted successfully", null));
    }

    @GetMapping("/{assignmentId}/submissions")
    public ResponseEntity<ApiResponse<List<SubmissionResponseDto>>> submissions(
            @PathVariable Long assignmentId,
            Authentication auth) {

        List<SubmissionResponseDto> data =
                service.getSubmissions(assignmentId, Long.valueOf(auth.getName()));

        return ResponseEntity.ok(
                ApiResponse.success("Submissions fetched successfully", data));
    }

    @GetMapping("/{assignmentId}/submissions/{studentId}/download")
    public ResponseEntity<Resource> downloadSubmissionFile(
            @PathVariable Long assignmentId,
            @PathVariable Long studentId,
            Authentication auth) {

        FileDownloadDto file = service.downloadSubmissionFile(
                assignmentId,
                studentId,
                Long.valueOf(auth.getName())
        );

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .header(
                        "Content-Disposition",
                        ContentDisposition.attachment().filename(file.getFileName()).build().toString()
                )
                .body(file.getResource());
    }

    @PutMapping("/{assignmentId}/evaluate/{studentId}")
    public ResponseEntity<ApiResponse<Void>> evaluate(
            @PathVariable Long assignmentId,
            @PathVariable Long studentId,
            @RequestBody AssignmentEvaluationRequest request,
            Authentication auth) {

        service.evaluateTextAssignment(
                assignmentId,
                studentId,
                request,
                Long.valueOf(auth.getName())
        );

        return ResponseEntity.ok(
                ApiResponse.success("Assignment evaluated successfully", null)
        );
    }

}

