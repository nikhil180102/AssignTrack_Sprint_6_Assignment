package com.assignment.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class McqAnswerDto {

    private Integer questionNumber;      // 1, 2, 3...
    private Integer selectedOptionIndex; // 0-based index
}
