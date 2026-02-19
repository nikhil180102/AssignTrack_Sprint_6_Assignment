package com.assignment.service.teacher;

import com.assignment.dto.*;
import com.assignment.entity.AssignmentStatus;
import com.assignment.entity.AssignmentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TeacherTextAssignmentService {

    AssignmentResponseDto createAssignment(
            AssignmentCreateRequest req, Long teacherId);

    void publishAssignment(Long id, Long teacherId);

    void closeAssignment(Long id, Long teacherId);

    Page<AssignmentResponseDto> myAssignments(
            Long teacherId,
            String search,
            AssignmentType type,
            AssignmentStatus status,
            Pageable pageable
    );

    AssignmentResponseDto getAssignment(Long assignmentId, Long teacherId);

    AssignmentResponseDto updateAssignment(
            Long assignmentId,
            AssignmentUpdateRequest request,
            Long teacherId);

    void deleteAssignment(Long assignmentId, Long teacherId);

    List<SubmissionResponseDto> getSubmissions(Long assignmentId, Long teacherId);

    FileDownloadDto downloadSubmissionFile(
            Long assignmentId,
            Long studentId,
            Long teacherId
    );

    void evaluateTextAssignment(
            Long assignmentId,
            Long studentId,
            AssignmentEvaluationRequest request,
            Long teacherId);
}

