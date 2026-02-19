package com.assignment.dto;

import lombok.Data;

@Data
public class AssignmentUpdateRequest {

    private String title;
    private String description;
    private Integer maxMarks;
}
