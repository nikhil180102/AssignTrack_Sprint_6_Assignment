package com.batch.service;

import com.batch.dto.BatchDetailsDto;
import com.batch.dto.BatchResponseDto;
import com.batch.dto.CreateBatchRequest;
import com.batch.entity.Batch;
import com.batch.entity.BatchStatus;
import com.batch.entity.BatchTeacher;
import com.batch.exception.BadRequestException;
import com.batch.exception.ResourceNotFoundException;
import com.batch.repository.BatchEnrollmentRepository;
import com.batch.repository.BatchRepository;
import com.batch.repository.BatchTeacherRepository;
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
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BatchServiceImplTest {

    @Mock private BatchRepository batchRepository;
    @Mock private BatchTeacherRepository batchTeacherRepository;
    @Mock private BatchEnrollmentRepository batchEnrollmentRepository;
    @Mock private ModelMapper modelMapper;

    @InjectMocks
    private BatchServiceImpl batchService;

    private Batch batch;

    @BeforeEach
    void setUp() {
        batch = new Batch();
        batch.setId(1L);
        batch.setBatchCode("BATCH-JAVA");
        batch.setName("Java Fundamentals");
        batch.setStartDate(LocalDate.of(2026, 3, 1));
        batch.setStatus(BatchStatus.DRAFT);
    }

    @Test
    void createBatch_success() {
        CreateBatchRequest request = new CreateBatchRequest();
        request.setBatchCode("BATCH-JAVA");
        request.setName("Java Fundamentals");
        request.setStartDate(LocalDate.of(2026, 3, 1));

        BatchResponseDto mapped = new BatchResponseDto();
        mapped.setId(1L);
        mapped.setBatchCode("BATCH-JAVA");

        when(batchRepository.findByBatchCode("BATCH-JAVA")).thenReturn(Optional.empty());
        when(batchRepository.save(any(Batch.class))).thenReturn(batch);
        when(modelMapper.map(batch, BatchResponseDto.class)).thenReturn(mapped);

        BatchResponseDto result = batchService.createBatch(request);

        assertNotNull(result);
        assertEquals("BATCH-JAVA", result.getBatchCode());
        verify(batchRepository).save(any(Batch.class));
    }

    @Test
    void createBatch_duplicateCode_throwsBadRequest() {
        CreateBatchRequest request = new CreateBatchRequest();
        request.setBatchCode("BATCH-JAVA");
        request.setName("Java Fundamentals");
        request.setStartDate(LocalDate.of(2026, 3, 1));

        when(batchRepository.findByBatchCode("BATCH-JAVA")).thenReturn(Optional.of(batch));

        assertThrows(BadRequestException.class, () -> batchService.createBatch(request));
    }

    @Test
    void publishBatch_success() {
        when(batchRepository.findById(1L)).thenReturn(Optional.of(batch));

        batchService.publishBatch(1L);

        assertEquals(BatchStatus.PUBLISHED, batch.getStatus());
        verify(batchRepository).save(batch);
    }

    @Test
    void publishBatch_invalidStatus_throwsBadRequest() {
        batch.setStatus(BatchStatus.PUBLISHED);
        when(batchRepository.findById(1L)).thenReturn(Optional.of(batch));

        assertThrows(BadRequestException.class, () -> batchService.publishBatch(1L));
    }

    @Test
    void closeBatch_success() {
        batch.setStatus(BatchStatus.PUBLISHED);
        when(batchRepository.findById(1L)).thenReturn(Optional.of(batch));

        batchService.closeBatch(1L);

        assertEquals(BatchStatus.CLOSED, batch.getStatus());
        verify(batchRepository).save(batch);
    }

    @Test
    void assignTeacher_alreadyAssigned_throwsBadRequest() {
        when(batchRepository.findById(1L)).thenReturn(Optional.of(batch));
        when(batchTeacherRepository.existsByBatch_IdAndTeacherId(1L, 10L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> batchService.assignTeacher(1L, 10L));
    }

    @Test
    void getBatchDetails_success() {
        BatchTeacher teacher = new BatchTeacher();
        teacher.setId(100L);
        teacher.setTeacherId(10L);
        teacher.setBatch(batch);

        BatchDetailsDto mapped = BatchDetailsDto.builder().id(1L).build();
        BatchResponseDto batchDto = new BatchResponseDto();
        batchDto.setId(1L);
        batchDto.setBatchCode("BATCH-JAVA");

        when(batchRepository.findById(1L)).thenReturn(Optional.of(batch));
        when(batchTeacherRepository.findByBatch_Id(1L)).thenReturn(List.of(teacher));
        when(batchEnrollmentRepository.countByBatch_Id(1L)).thenReturn(5L);
        when(modelMapper.map(batch, BatchDetailsDto.class)).thenReturn(mapped);
        when(modelMapper.map(batch, BatchResponseDto.class)).thenReturn(batchDto);

        BatchDetailsDto result = batchService.getBatchDetails(1L);

        assertNotNull(result);
        assertEquals(1, result.getTeacherCount());
        assertEquals(5, result.getStudentCount());
        assertEquals(1, result.getTeachers().size());
    }

    @Test
    void getBatchDetails_notFound_throwsResourceNotFound() {
        when(batchRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> batchService.getBatchDetails(1L));
    }
}

