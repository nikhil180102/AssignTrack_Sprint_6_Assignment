package com.assignment.dto;

import com.assignment.entity.AssignmentType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StudentAssignmentDto {

    private Long assignmentId;  // Keep this name
    private Long batchId;
    private String title;
    private String description;
    private AssignmentType type;
    private Integer maxMarks;
    private Boolean submitted;
    private Integer obtainedMarks;
    private String feedback;
    private LocalDateTime evaluatedAt;
}
