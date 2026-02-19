package com.assignment.dto;

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
public class McqSubmissionResponseDto {
    private Long submissionId;
    private Long assignmentId;
    private String assignmentTitle;
    private Integer totalMarks;
    private Integer obtainedMarks;
    private Double percentage;
    private Boolean passed;
    private LocalDateTime submittedAt;
    private Integer timeTaken; // in seconds
    private Integer correctCount;
    private Integer incorrectCount;
    private Integer totalQuestions;
    private List<McqQuestionResultDto> questionResults;
}
