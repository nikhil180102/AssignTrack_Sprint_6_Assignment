package com.assignment.dto;

import com.assignment.entity.AssignmentStatus;
import com.assignment.entity.AssignmentType;
import lombok.Data;

@Data
public class AssignmentResponseDto {

    private Long id;
    private Long batchId;
    private String batchCode;
    private String title;
    private String description;
    private AssignmentType type;
    private Integer maxMarks;
    private AssignmentStatus status;
    private Integer totalSubmissions;
}
