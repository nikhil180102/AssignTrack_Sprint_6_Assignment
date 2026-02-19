package com.batch.service;

import com.batch.dto.BatchContentDto;
import com.batch.dto.BatchResponseDto;

import java.util.List;

public interface StudentBatchService {

    List<BatchResponseDto> listPublishedBatches();

    void enroll(Long batchId, Long studentId);

    List<BatchResponseDto> myBatches(Long studentId);

    List<BatchContentDto> getBatchContentsForStudent(Long batchId, Long studentId);

    void markContentCompleted(Long batchId, Long contentId, Long studentId);

    void unmarkContentCompleted(Long batchId, Long contentId, Long studentId);
}
