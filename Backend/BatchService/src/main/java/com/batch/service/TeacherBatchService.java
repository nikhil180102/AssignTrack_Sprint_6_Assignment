package com.batch.service;

import com.batch.dto.BatchDetailsDto;
import com.batch.dto.BatchContentDto;
import com.batch.dto.BatchContentRequest;
import com.batch.dto.BatchTeacherDto;

import java.util.List;

public interface TeacherBatchService {
    List<BatchTeacherDto> getMyBatches(Long teacherId);
    BatchDetailsDto getBatchDetailsForTeacher(Long batchId, Long teacherId);
    BatchContentDto addBatchContent(Long batchId, Long teacherId, BatchContentRequest request);
    List<BatchContentDto> getBatchContents(Long batchId, Long teacherId);
    BatchContentDto updateBatchContent(Long batchId, Long contentId, Long teacherId, BatchContentRequest request);
    void removeBatchContent(Long batchId, Long contentId, Long teacherId);
}
