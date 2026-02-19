package com.assignment.service.teacher;

import com.assignment.dto.McqAssignmentCreateRequest;
import com.assignment.dto.McqAssignmentResponseDto;
import com.assignment.dto.McqAssignmentUpdateRequest;
import com.assignment.dto.McqSubmissionSummaryDto;

import java.util.List;

public interface TeacherMcqAssignmentService {

    McqAssignmentResponseDto createMcqAssignment(
            McqAssignmentCreateRequest request,
            Long teacherId
    );

    void publishMcqAssignment(Long assignmentId, Long teacherId);

    void closeMcqAssignment(Long assignmentId, Long teacherId);

    McqAssignmentResponseDto getMcqAssignment(
            Long assignmentId,
            Long teacherId
    );

    McqAssignmentResponseDto updateMcqAssignment(
            Long assignmentId,
            McqAssignmentUpdateRequest request,
            Long teacherId
    );

    void deleteMcqAssignment(Long assignmentId, Long teacherId);

    List<McqSubmissionSummaryDto> getMcqSubmissions(
            Long assignmentId,
            Long teacherId
    );
}
