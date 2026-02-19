package com.assignment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class McqQuestionResultDto {
    private Long questionId;
    private String questionText;
    private Integer marks;
    private Integer marksObtained;
    private Boolean isCorrect;

    private List<McqOptionDto> options;
    private List<Integer> selectedOptions;
    private List<Integer> correctAnswers;
}