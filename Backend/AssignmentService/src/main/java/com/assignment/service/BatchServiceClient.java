package com.assignment.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
@FeignClient(name = "BATCHSERVICE")
public interface BatchServiceClient {

    @GetMapping("/internal/batches/teacher/{teacherId}/validate/{batchId}")
    Boolean validateTeacherBatch(
            @PathVariable Long teacherId,
            @PathVariable Long batchId
    );

    @GetMapping("/internal/batches/student/{studentId}")
    List<Long> getStudentBatchIds(
            @PathVariable Long studentId
    );

    @GetMapping("/internal/batches/{batchId}/students")
    List<Long> getBatchStudentIds(
            @PathVariable Long batchId
    );

    @GetMapping("/internal/batches/{batchId}/code")
    String getBatchCode(
            @PathVariable Long batchId
    );
}
