package com.batch.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BatchContentRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String url;
    private Integer orderIndex;
}

