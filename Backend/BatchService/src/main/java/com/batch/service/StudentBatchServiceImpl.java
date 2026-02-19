package com.batch.service;

import com.batch.dto.BatchResponseDto;
import com.batch.dto.BatchContentDto;
import com.batch.entity.Batch;
import com.batch.entity.BatchContent;
import com.batch.entity.BatchEnrollment;
import com.batch.entity.BatchStatus;
import com.batch.entity.StudentContentProgress;
import com.batch.exception.BadRequestException;
import com.batch.exception.ResourceNotFoundException;
import com.batch.repository.BatchContentRepository;
import com.batch.repository.BatchEnrollmentRepository;
import com.batch.repository.BatchRepository;
import com.batch.repository.StudentContentProgressRepository;
import com.batch.service.StudentBatchService;
import com.batch.service.NotificationPublisher;
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
public class StudentBatchServiceImpl implements StudentBatchService {

    private final BatchRepository batchRepository;
    private final BatchEnrollmentRepository enrollmentRepository;
    private final BatchContentRepository batchContentRepository;
    private final StudentContentProgressRepository studentContentProgressRepository;
    private final ModelMapper modelMapper;
    private final NotificationPublisher notificationPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<BatchResponseDto> listPublishedBatches() {
List<Batch> batches = batchRepository.findAll();
return batches.stream()
                .filter(b -> b.getStatus() == BatchStatus.PUBLISHED)
                .map(b -> modelMapper.map(b, BatchResponseDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void enroll(Long batchId, Long studentId) {
Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        if (batch.getStatus() != BatchStatus.PUBLISHED) {
            throw new BadRequestException("Batch is not open for enrollment");
        }

        if (enrollmentRepository.existsByBatch_IdAndStudentId(batchId, studentId)) {
            throw new BadRequestException("Already enrolled in this batch");
        }

        BatchEnrollment enrollment = new BatchEnrollment();
        enrollment.setBatch(batch);
        enrollment.setStudentId(studentId);

        enrollmentRepository.save(enrollment);
notificationPublisher.publish(
                new com.batch.dto.NotificationEvent(
                        studentId,
                        null,
                        "STUDENT",
                        "IN_APP",
                        "Enrollment successful",
                        "You have been enrolled in batch: " + batch.getName()
                )
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<BatchResponseDto> myBatches(Long studentId) {
List<BatchEnrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
return enrollments.stream()
                .map(enrollment -> modelMapper.map(enrollment.getBatch(), BatchResponseDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BatchContentDto> getBatchContentsForStudent(Long batchId, Long studentId) {
        if (!enrollmentRepository.existsByBatch_IdAndStudentId(batchId, studentId)) {
            throw new BadRequestException("Student is not enrolled in this batch");
        }
        var completedIds = studentContentProgressRepository
                .findByStudentIdAndContent_Batch_Id(studentId, batchId)
                .stream()
                .filter(StudentContentProgress::isCompleted)
                .map(p -> p.getContent().getId())
                .collect(Collectors.toSet());

        return batchContentRepository.findByBatch_IdOrderByOrderIndexAscIdAsc(batchId).stream()
                .map(c -> {
                    BatchContentDto dto = new BatchContentDto();
                    dto.setId(c.getId());
                    dto.setBatchId(batchId);
                    dto.setTitle(c.getTitle());
                    dto.setUrl(c.getUrl());
                    dto.setOrderIndex(c.getOrderIndex());
                    dto.setCreatedByTeacherId(c.getCreatedByTeacherId());
                    dto.setCompleted(completedIds.contains(c.getId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markContentCompleted(Long batchId, Long contentId, Long studentId) {
        if (!enrollmentRepository.existsByBatch_IdAndStudentId(batchId, studentId)) {
            throw new BadRequestException("Student is not enrolled in this batch");
        }
        BatchContent content = batchContentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));
        if (!content.getBatch().getId().equals(batchId)) {
            throw new BadRequestException("Content does not belong to this batch");
        }
        StudentContentProgress progress = studentContentProgressRepository
                .findByStudentIdAndContent_Id(studentId, contentId)
                .orElseGet(() -> {
                    StudentContentProgress p = new StudentContentProgress();
                    p.setStudentId(studentId);
                    p.setContent(content);
                    return p;
                });
        progress.setCompleted(true);
        progress.setCompletedAt(java.time.LocalDateTime.now());
        studentContentProgressRepository.save(progress);
    }

    @Override
    @Transactional
    public void unmarkContentCompleted(Long batchId, Long contentId, Long studentId) {
        if (!enrollmentRepository.existsByBatch_IdAndStudentId(batchId, studentId)) {
            throw new BadRequestException("Student is not enrolled in this batch");
        }
        BatchContent content = batchContentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));
        if (!content.getBatch().getId().equals(batchId)) {
            throw new BadRequestException("Content does not belong to this batch");
        }
        studentContentProgressRepository.findByStudentIdAndContent_Id(studentId, contentId)
                .ifPresent(studentContentProgressRepository::delete);
    }
}
