package com.assignment.dto;

import com.assignment.entity.AssignmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class McqAssignmentResponseDto {
    private Long assignmentId;
    private Long batchId;
    private String title;
    private String description;
    private Integer maxMarks;
    private AssignmentStatus status;
    private Integer passingPercentage;
    private Boolean showCorrectAnswers;
    private Integer timeLimit;
    private Integer totalQuestions;

    private List<McqQuestionDto> questions;

    private LocalDateTime createdAt;
}
