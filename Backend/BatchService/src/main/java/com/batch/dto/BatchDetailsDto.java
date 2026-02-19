package com.batch.dto;

import com.batch.entity.BatchStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchDetailsDto {
    private Long id;
    private String batchCode;
    private String name;
    private LocalDate startDate;
    private BatchStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer teacherCount;
    private Integer studentCount;
    private List<BatchTeacherDto> teachers;
}