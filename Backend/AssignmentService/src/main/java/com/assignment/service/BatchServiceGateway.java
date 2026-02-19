package com.assignment.service;

import com.assignment.exception.ServiceUnavailableException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BatchServiceGateway {

    private final BatchServiceClient batchServiceClient;

    @CircuitBreaker(name = "batchService", fallbackMethod = "validateTeacherBatchFallback")
    @Retry(name = "batchService")
    public Boolean validateTeacherBatch(Long teacherId, Long batchId) {
        return batchServiceClient.validateTeacherBatch(teacherId, batchId);
    }

    @CircuitBreaker(name = "batchService", fallbackMethod = "getStudentBatchIdsFallback")
    @Retry(name = "batchService")
    public List<Long> getStudentBatchIds(Long studentId) {
        return batchServiceClient.getStudentBatchIds(studentId);
    }

    @CircuitBreaker(name = "batchService", fallbackMethod = "getBatchStudentIdsFallback")
    @Retry(name = "batchService")
    public List<Long> getBatchStudentIds(Long batchId) {
        return batchServiceClient.getBatchStudentIds(batchId);
    }

    @CircuitBreaker(name = "batchService", fallbackMethod = "getBatchCodeFallback")
    @Retry(name = "batchService")
    public String getBatchCode(Long batchId) {
        return batchServiceClient.getBatchCode(batchId);
    }

    private Boolean validateTeacherBatchFallback(Long teacherId, Long batchId, Throwable ex) {
        throw new ServiceUnavailableException("Batch service unavailable. Please try again.");
    }

    private List<Long> getStudentBatchIdsFallback(Long studentId, Throwable ex) {
        throw new ServiceUnavailableException("Batch service unavailable. Please try again.");
    }

    private List<Long> getBatchStudentIdsFallback(Long batchId, Throwable ex) {
        throw new ServiceUnavailableException("Batch service unavailable. Please try again.");
    }

    private String getBatchCodeFallback(Long batchId, Throwable ex) {
        return "BATCH-" + batchId;
    }
}
