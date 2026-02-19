package com.assignment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class McqSubmissionSummaryDto {
    private Long submissionId;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Integer obtainedMarks;
    private Integer totalMarks;
    private Double percentage;
    private Boolean passed;
    private String status;
    private LocalDateTime submittedAt;
}
