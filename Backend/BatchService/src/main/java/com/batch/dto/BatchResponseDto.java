package com.batch.dto;

import com.batch.entity.BatchStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BatchResponseDto {
    private Long id;
    private String batchCode;
    private String name;
    private LocalDate startDate;
    private BatchStatus status;
}
