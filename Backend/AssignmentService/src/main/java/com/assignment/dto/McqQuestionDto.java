package com.assignment.dto;

import com.assignment.dto.McqOptionDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class McqQuestionDto {
    private Long id;
    private Integer questionNumber;
    private String questionText;
    private Integer marks;
    private List<McqOptionDto> options;
    private List<Integer> correctAnswers;
}