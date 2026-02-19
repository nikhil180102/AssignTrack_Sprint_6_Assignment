package com.assignment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class McqSubmissionRequest {
@NotNull(message = "answers must not be null")
    private List<McqAnswerDto> answers;

    private Integer timeTaken; // in seconds
}