package com.assignment.service.student;

import com.assignment.dto.AssignmentSubmitRequest;
import com.assignment.dto.StudentAssignmentDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface StudentAssignmentService {

    List<StudentAssignmentDto> listAssignments(Long studentId);

    void submitAssignment(
            Long assignmentId,
            AssignmentSubmitRequest request,
            Long studentId
    );

    void submitFileAssignment(
            Long assignmentId,
            MultipartFile file,
            Long studentId
    );

    void evictStudentAssignments(Long studentId);
}
