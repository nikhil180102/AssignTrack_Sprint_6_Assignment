package com.assignment.dto;

import com.assignment.entity.AssignmentType;
import lombok.Data;

@Data
public class AssignmentCreateRequest {

    private Long batchId;
    private String title;
    private String description;
    private AssignmentType type;
    private Integer maxMarks;
}
