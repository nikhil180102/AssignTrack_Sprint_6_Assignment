package com.batch.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BatchTeacherDto {
    private Long id;
    private Long teacherId;
    private BatchResponseDto batch;
    private Integer studentCount;
}
