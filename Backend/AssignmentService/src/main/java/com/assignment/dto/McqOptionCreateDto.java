package com.assignment.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
public class McqOptionCreateDto {

    @NotBlank
    private String text;

    @NotNull
    private Boolean isCorrect;
}
