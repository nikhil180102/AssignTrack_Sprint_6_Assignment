package com.batch.service;

import com.batch.dto.*;

import java.util.List;

public interface BatchService {

    BatchResponseDto createBatch(CreateBatchRequest request);

    List<BatchResponseDto> getAllBatches();

    BatchDetailsDto getBatchDetails(Long batchId);

    void publishBatch(Long batchId);

    void closeBatch(Long batchId);

    void assignTeacher(Long batchId, Long teacherId);

    void removeTeacherFromBatch(Long batchId, Long teacherId);

    List<BatchTeacherDto> getBatchTeachers(Long batchId);

    List<BatchContentDto> getBatchContents(Long batchId);

    BatchContentDto updateBatchContent(Long batchId, Long contentId, BatchContentRequest request);

    void removeBatchContent(Long batchId, Long contentId);
}
