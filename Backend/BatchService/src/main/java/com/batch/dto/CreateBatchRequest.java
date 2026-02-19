package com.batch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateBatchRequest {

    @NotBlank(message = "Batch code is required")
    private String batchCode;

    @NotBlank(message = "Batch name is required")
    private String name;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;
}