package com.assignment.service.student;

import com.assignment.dto.McqAssignmentResponseDto;
import com.assignment.dto.McqSubmissionRequest;
import com.assignment.dto.McqSubmissionResponseDto;

public interface StudentMcqService {
    McqAssignmentResponseDto getMcqAssignmentForStudent(Long assignmentId, Long studentId);

    McqSubmissionResponseDto submitMcqAssignment(Long assignmentId, McqSubmissionRequest request, Long studentId);

    McqSubmissionResponseDto getMcqSubmissionResult(Long assignmentId, Long studentId);
}
