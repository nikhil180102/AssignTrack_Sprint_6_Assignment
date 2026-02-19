package com.batch.service;

import com.batch.dto.BatchResponseDto;
import com.batch.entity.Batch;
import com.batch.entity.BatchEnrollment;
import com.batch.entity.BatchStatus;
import com.batch.exception.BadRequestException;
import com.batch.exception.ResourceNotFoundException;
import com.batch.repository.BatchEnrollmentRepository;
import com.batch.repository.BatchRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentBatchServiceImplTest {

    @Mock private BatchRepository batchRepository;
    @Mock private BatchEnrollmentRepository enrollmentRepository;
    @Mock private ModelMapper modelMapper;
    @Mock private NotificationPublisher notificationPublisher;

    @InjectMocks
    private StudentBatchServiceImpl studentBatchService;

    private Batch publishedBatch;
    private Batch draftBatch;

    @BeforeEach
    void setUp() {
        publishedBatch = new Batch();
        publishedBatch.setId(1L);
        publishedBatch.setBatchCode("BATCH-JAVA");
        publishedBatch.setName("Java Fundamentals");
        publishedBatch.setStartDate(LocalDate.of(2026, 3, 1));
        publishedBatch.setStatus(BatchStatus.PUBLISHED);

        draftBatch = new Batch();
        draftBatch.setId(2L);
        draftBatch.setBatchCode("BATCH-REDUX");
        draftBatch.setName("Redux");
        draftBatch.setStartDate(LocalDate.of(2026, 3, 2));
        draftBatch.setStatus(BatchStatus.DRAFT);
    }

    @Test
    void listPublishedBatches_returnsOnlyPublished() {
        BatchResponseDto dto = new BatchResponseDto();
        dto.setId(1L);
        dto.setBatchCode("BATCH-JAVA");

        when(batchRepository.findAll()).thenReturn(List.of(publishedBatch, draftBatch));
        when(modelMapper.map(publishedBatch, BatchResponseDto.class)).thenReturn(dto);

        List<BatchResponseDto> result = studentBatchService.listPublishedBatches();

        assertEquals(1, result.size());
        assertEquals("BATCH-JAVA", result.get(0).getBatchCode());
    }

    @Test
    void enroll_success() {
        when(batchRepository.findById(1L)).thenReturn(Optional.of(publishedBatch));
        when(enrollmentRepository.existsByBatch_IdAndStudentId(1L, 11L)).thenReturn(false);
        studentBatchService.enroll(1L, 11L);

        verify(enrollmentRepository).save(any(BatchEnrollment.class));
        verify(notificationPublisher).publish(any());
    }

    @Test
    void enroll_batchNotFound_throwsResourceNotFound() {
        when(batchRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> studentBatchService.enroll(99L, 11L));
    }

    @Test
    void enroll_batchNotPublished_throwsBadRequest() {
        when(batchRepository.findById(2L)).thenReturn(Optional.of(draftBatch));

        assertThrows(BadRequestException.class, () -> studentBatchService.enroll(2L, 11L));
    }

    @Test
    void enroll_alreadyEnrolled_throwsBadRequest() {
        when(batchRepository.findById(1L)).thenReturn(Optional.of(publishedBatch));
        when(enrollmentRepository.existsByBatch_IdAndStudentId(1L, 11L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> studentBatchService.enroll(1L, 11L));
    }
}
