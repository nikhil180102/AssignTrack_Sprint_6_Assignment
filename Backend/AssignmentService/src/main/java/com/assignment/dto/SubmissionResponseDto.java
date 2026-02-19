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
public class SubmissionResponseDto {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Integer score;
    private Integer maxMarks;
    private String status;
    private LocalDateTime submittedAt;
    private String submissionContent;
    private String fileName;
    private String feedback;
    private LocalDateTime evaluatedAt;
}
