package com.batch.service;

import com.batch.dto.BatchDetailsDto;
import com.batch.dto.BatchContentDto;
import com.batch.dto.BatchContentRequest;
import com.batch.dto.BatchResponseDto;
import com.batch.dto.BatchTeacherDto;
import com.batch.entity.Batch;
import com.batch.entity.BatchContent;
import com.batch.entity.BatchTeacher;
import com.batch.exception.AccessDeniedException;
import com.batch.exception.ResourceNotFoundException;
import com.batch.exception.BadRequestException;
import com.batch.repository.BatchContentRepository;
import com.batch.repository.BatchTeacherRepository;
import com.batch.repository.BatchEnrollmentRepository;
import com.batch.service.TeacherBatchService;
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
public class TeacherBatchServiceImpl implements TeacherBatchService {

    private final BatchTeacherRepository batchTeacherRepository;
    private final BatchEnrollmentRepository batchEnrollmentRepository;
    private final BatchContentRepository batchContentRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BatchTeacherDto> getMyBatches(Long teacherId) {
List<BatchTeacher> batchTeachers = batchTeacherRepository.findByTeacherId(teacherId);

        return batchTeachers.stream()
                .map(bt -> {
                    BatchTeacherDto dto = new BatchTeacherDto();
                    dto.setId(bt.getId());
                    dto.setTeacherId(bt.getTeacherId());
                    BatchResponseDto batchDto = modelMapper.map(bt.getBatch(), BatchResponseDto.class);
                    dto.setBatch(batchDto);

                    Long studentCount =
                            batchEnrollmentRepository.countByBatch_Id(bt.getBatch().getId());
                    dto.setStudentCount(studentCount != null ? studentCount.intValue() : 0);

                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BatchDetailsDto getBatchDetailsForTeacher(Long batchId, Long teacherId) {
        BatchTeacher batchTeacher =
                batchTeacherRepository
                        .findByBatch_IdAndTeacherId(batchId, teacherId)
                        .orElseThrow(() ->
                                new AccessDeniedException("Teacher not assigned to this batch"));

        Batch batch = batchTeacher.getBatch();
        List<BatchTeacher> teachers =
                batchTeacherRepository.findByBatch_Id(batchId);
        List<BatchTeacherDto> teacherDtos = teachers.stream()
                .map(bt -> {
                    BatchTeacherDto dto = new BatchTeacherDto();
                    dto.setId(bt.getId());
                    dto.setTeacherId(bt.getTeacherId());

                    BatchResponseDto batchDto =
                            modelMapper.map(bt.getBatch(), BatchResponseDto.class);
                    dto.setBatch(batchDto);

                    return dto;
                })
                .toList();
        Integer studentCount =
                batchEnrollmentRepository.countByBatch_Id(batch.getId()).intValue();

        return BatchDetailsDto.builder()
                .id(batch.getId())
                .batchCode(batch.getBatchCode())
                .name(batch.getName())
                .startDate(batch.getStartDate())
                .status(batch.getStatus())
                .createdAt(batch.getCreatedAt())
                .updatedAt(batch.getUpdatedAt())
                .teacherCount(teacherDtos.size())
                .studentCount(studentCount)
                .teachers(teacherDtos)
                .build();
    }

    @Override
    @Transactional
    public BatchContentDto addBatchContent(Long batchId, Long teacherId, BatchContentRequest request) {
        if (!batchTeacherRepository.existsByBatch_IdAndTeacherId(batchId, teacherId)) {
            throw new AccessDeniedException("Teacher not assigned to this batch");
        }
        Batch batch = batchTeacherRepository
                .findByBatch_IdAndTeacherId(batchId, teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"))
                .getBatch();
        BatchContent content = new BatchContent();
        content.setBatch(batch);
        content.setTitle(request.getTitle().trim());
        content.setUrl(request.getUrl().trim());
        content.setOrderIndex(request.getOrderIndex() == null ? 0 : request.getOrderIndex());
        content.setCreatedByTeacherId(teacherId);
        content = batchContentRepository.save(content);
        return toContentDto(content, false);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BatchContentDto> getBatchContents(Long batchId, Long teacherId) {
        if (!batchTeacherRepository.existsByBatch_IdAndTeacherId(batchId, teacherId)) {
            throw new AccessDeniedException("Teacher not assigned to this batch");
        }
        return batchContentRepository.findByBatch_IdOrderByOrderIndexAscIdAsc(batchId)
                .stream()
                .map(content -> toContentDto(content, false))
                .toList();
    }

    @Override
    @Transactional
    public BatchContentDto updateBatchContent(Long batchId, Long contentId, Long teacherId, BatchContentRequest request) {
        if (!batchTeacherRepository.existsByBatch_IdAndTeacherId(batchId, teacherId)) {
            throw new AccessDeniedException("Teacher not assigned to this batch");
        }
        BatchContent content = batchContentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));
        if (!content.getBatch().getId().equals(batchId)) {
            throw new BadRequestException("Content does not belong to this batch");
        }
        if (!content.getCreatedByTeacherId().equals(teacherId)) {
            throw new AccessDeniedException("Only the creator instructor can edit this content");
        }
        content.setTitle(request.getTitle().trim());
        content.setUrl(request.getUrl().trim());
        content.setOrderIndex(request.getOrderIndex() == null ? content.getOrderIndex() : request.getOrderIndex());
        content = batchContentRepository.save(content);
        return toContentDto(content, false);
    }

    @Override
    @Transactional
    public void removeBatchContent(Long batchId, Long contentId, Long teacherId) {
        if (!batchTeacherRepository.existsByBatch_IdAndTeacherId(batchId, teacherId)) {
            throw new AccessDeniedException("Teacher not assigned to this batch");
        }
        BatchContent content = batchContentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));
        if (!content.getBatch().getId().equals(batchId)) {
            throw new BadRequestException("Content does not belong to this batch");
        }
        if (!content.getCreatedByTeacherId().equals(teacherId)) {
            throw new AccessDeniedException("Only the creator instructor can delete this content");
        }
        batchContentRepository.delete(content);
    }

    private BatchContentDto toContentDto(BatchContent content, boolean completed) {
        BatchContentDto dto = new BatchContentDto();
        dto.setId(content.getId());
        dto.setBatchId(content.getBatch().getId());
        dto.setTitle(content.getTitle());
        dto.setUrl(content.getUrl());
        dto.setOrderIndex(content.getOrderIndex());
        dto.setCreatedByTeacherId(content.getCreatedByTeacherId());
        dto.setCompleted(completed);
        return dto;
    }

}

