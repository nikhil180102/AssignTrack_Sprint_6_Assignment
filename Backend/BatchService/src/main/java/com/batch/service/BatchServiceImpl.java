package com.batch.service;

import com.batch.dto.*;
import com.batch.entity.*;
import com.batch.exception.BadRequestException;
import com.batch.exception.ResourceNotFoundException;
import com.batch.repository.BatchContentRepository;
import com.batch.repository.BatchEnrollmentRepository;
import com.batch.repository.BatchRepository;
import com.batch.repository.BatchTeacherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BatchServiceImpl implements BatchService {

    private final BatchRepository batchRepository;
    private final BatchTeacherRepository batchTeacherRepository;
    private final BatchEnrollmentRepository batchEnrollmentRepository;
    private final BatchContentRepository batchContentRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public BatchResponseDto createBatch(CreateBatchRequest request) {
        if (batchRepository.findByBatchCode(request.getBatchCode()).isPresent()) {
            throw new BadRequestException("Batch code already exists: " + request.getBatchCode());
        }

        Batch batch = new Batch();
        batch.setBatchCode(request.getBatchCode());
        batch.setName(request.getName());
        batch.setStartDate(request.getStartDate());
        batch.setStatus(BatchStatus.DRAFT);

        batch = batchRepository.save(batch);
return modelMapper.map(batch, BatchResponseDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BatchResponseDto> getAllBatches() {

        return batchRepository.findAll().stream()
                .map(batch -> {
                    BatchResponseDto dto = modelMapper.map(batch, BatchResponseDto.class);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BatchDetailsDto getBatchDetails(Long batchId) {
Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with ID: " + batchId));
        List<BatchTeacher> batchTeachers = batchTeacherRepository.findByBatch_Id(batchId);
        Long studentCount = batchEnrollmentRepository.countByBatch_Id(batchId);

        BatchDetailsDto details = modelMapper.map(batch, BatchDetailsDto.class);
        details.setTeacherCount(batchTeachers.size());
        details.setStudentCount(studentCount.intValue());
        List<BatchTeacherDto> teacherDtos = batchTeachers.stream()
                .map(bt -> {
                    BatchTeacherDto dto = new BatchTeacherDto();
                    dto.setId(bt.getId());
                    dto.setTeacherId(bt.getTeacherId());
                    dto.setBatch(modelMapper.map(bt.getBatch(), BatchResponseDto.class));
                    return dto;
                })
                .collect(Collectors.toList());

        details.setTeachers(teacherDtos);

        return details;
    }

    @Override
    @Transactional
    public void publishBatch(Long batchId) {
Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with ID: " + batchId));

        if (batch.getStatus() != BatchStatus.DRAFT) {
            throw new BadRequestException("Only DRAFT batches can be published");
        }

        batch.setStatus(BatchStatus.PUBLISHED);
        batchRepository.save(batch);
    }

    @Override
    @Transactional
    public void closeBatch(Long batchId) {
Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with ID: " + batchId));

        if (batch.getStatus() != BatchStatus.PUBLISHED) {
            throw new BadRequestException("Only PUBLISHED batches can be closed");
        }

        batch.setStatus(BatchStatus.CLOSED);
        batchRepository.save(batch);
    }

    @Override
    @Transactional
    public void assignTeacher(Long batchId, Long teacherId) {
Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with ID: " + batchId));
        if (batchTeacherRepository.existsByBatch_IdAndTeacherId(batchId, teacherId)) {
            throw new BadRequestException("Teacher is already assigned to this batch");
        }

        BatchTeacher batchTeacher = new BatchTeacher();
        batchTeacher.setBatch(batch);
        batchTeacher.setTeacherId(teacherId);

        batchTeacherRepository.save(batchTeacher);
    }

    @Override
    @Transactional
    public void removeTeacherFromBatch(Long batchId, Long teacherId) {
BatchTeacher batchTeacher = batchTeacherRepository
                .findByBatch_IdAndTeacherId(batchId, teacherId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Teacher assignment not found for batch: " + batchId + " and teacher: " + teacherId));

        batchTeacherRepository.delete(batchTeacher);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BatchTeacherDto> getBatchTeachers(Long batchId) {
        if (!batchRepository.existsById(batchId)) {
            throw new ResourceNotFoundException("Batch not found with ID: " + batchId);
        }

        return batchTeacherRepository.findByBatch_Id(batchId).stream()
                .map(bt -> {
                    BatchTeacherDto dto = new BatchTeacherDto();
                    dto.setId(bt.getId());
                    dto.setTeacherId(bt.getTeacherId());
                    dto.setBatch(modelMapper.map(bt.getBatch(), BatchResponseDto.class));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BatchContentDto> getBatchContents(Long batchId) {
        if (!batchRepository.existsById(batchId)) {
            throw new ResourceNotFoundException("Batch not found with ID: " + batchId);
        }
        return batchContentRepository.findByBatch_IdOrderByOrderIndexAscIdAsc(batchId).stream()
                .map(c -> {
                    BatchContentDto dto = new BatchContentDto();
                    dto.setId(c.getId());
                    dto.setBatchId(batchId);
                    dto.setTitle(c.getTitle());
                    dto.setUrl(c.getUrl());
                    dto.setOrderIndex(c.getOrderIndex());
                    dto.setCreatedByTeacherId(c.getCreatedByTeacherId());
                    dto.setCompleted(false);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BatchContentDto updateBatchContent(Long batchId, Long contentId, BatchContentRequest request) {
        if (!batchRepository.existsById(batchId)) {
            throw new ResourceNotFoundException("Batch not found with ID: " + batchId);
        }
        BatchContent content = batchContentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));
        if (!content.getBatch().getId().equals(batchId)) {
            throw new BadRequestException("Content does not belong to this batch");
        }
        content.setTitle(request.getTitle().trim());
        content.setUrl(request.getUrl().trim());
        content.setOrderIndex(request.getOrderIndex() == null ? content.getOrderIndex() : request.getOrderIndex());
        content = batchContentRepository.save(content);
        BatchContentDto dto = new BatchContentDto();
        dto.setId(content.getId());
        dto.setBatchId(batchId);
        dto.setTitle(content.getTitle());
        dto.setUrl(content.getUrl());
        dto.setOrderIndex(content.getOrderIndex());
        dto.setCreatedByTeacherId(content.getCreatedByTeacherId());
        dto.setCompleted(false);
        return dto;
    }

    @Override
    @Transactional
    public void removeBatchContent(Long batchId, Long contentId) {
        if (!batchRepository.existsById(batchId)) {
            throw new ResourceNotFoundException("Batch not found with ID: " + batchId);
        }
        BatchContent content = batchContentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));
        if (!content.getBatch().getId().equals(batchId)) {
            throw new BadRequestException("Content does not belong to this batch");
        }
        batchContentRepository.delete(content);
    }

}
