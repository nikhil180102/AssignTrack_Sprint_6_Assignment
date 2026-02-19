package com.batch.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignTeacherRequest {

    @NotNull(message = "Teacher ID is required")
    private Long teacherId;
}