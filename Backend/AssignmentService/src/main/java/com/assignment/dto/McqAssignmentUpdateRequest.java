package com.assignment.dto;

import lombok.Data;

import java.util.List;

@Data
public class McqAssignmentUpdateRequest {

    private String title;
    private String description;
    private Integer maxMarks;

    private Integer passingPercentage;
    private Boolean showCorrectAnswers;
    private Integer timeLimit;

    private List<McqQuestionCreateDto> questions;
}
