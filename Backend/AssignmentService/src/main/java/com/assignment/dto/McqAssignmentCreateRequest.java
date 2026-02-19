package com.assignment.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class McqAssignmentCreateRequest {

    @NotNull
    private Long batchId;

    @NotBlank
    private String title;

    private String description;

    @NotNull
    @Min(1)
    private Integer maxMarks;
    @NotNull
    @Min(0)
    @Max(100)
    private Integer passingPercentage;

    @NotNull
    private Boolean showCorrectAnswers;

    private Integer timeLimit; // in minutes

    @NotNull
    private List<McqQuestionCreateDto> questions;
}
