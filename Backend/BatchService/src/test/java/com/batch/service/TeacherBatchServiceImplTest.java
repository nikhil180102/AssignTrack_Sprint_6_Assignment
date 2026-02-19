package com.batch.service;

import com.batch.dto.BatchDetailsDto;
import com.batch.dto.BatchResponseDto;
import com.batch.dto.BatchTeacherDto;
import com.batch.entity.Batch;
import com.batch.entity.BatchStatus;
import com.batch.entity.BatchTeacher;
import com.batch.exception.AccessDeniedException;
import com.batch.repository.BatchEnrollmentRepository;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TeacherBatchServiceImplTest {

    @Mock private BatchTeacherRepository batchTeacherRepository;
    @Mock private BatchEnrollmentRepository batchEnrollmentRepository;
    @Mock private ModelMapper modelMapper;

    @InjectMocks
    private TeacherBatchServiceImpl teacherBatchService;

    private Batch batch;
    private BatchTeacher assignment;

    @BeforeEach
    void setUp() {
        batch = new Batch();
        batch.setId(1L);
        batch.setBatchCode("BATCH-JAVA");
        batch.setName("Java Fundamentals");
        batch.setStartDate(LocalDate.of(2026, 3, 1));
        batch.setStatus(BatchStatus.PUBLISHED);

        assignment = new BatchTeacher();
        assignment.setId(100L);
        assignment.setTeacherId(10L);
        assignment.setBatch(batch);
    }

    @Test
    void getMyBatches_success() {
        BatchResponseDto batchDto = new BatchResponseDto();
        batchDto.setId(1L);
        batchDto.setBatchCode("BATCH-JAVA");

        when(batchTeacherRepository.findByTeacherId(10L)).thenReturn(List.of(assignment));
        when(modelMapper.map(batch, BatchResponseDto.class)).thenReturn(batchDto);
        when(batchEnrollmentRepository.countByBatch_Id(1L)).thenReturn(8L);

        List<BatchTeacherDto> result = teacherBatchService.getMyBatches(10L);

        assertEquals(1, result.size());
        assertEquals(8, result.get(0).getStudentCount());
        assertEquals("BATCH-JAVA", result.get(0).getBatch().getBatchCode());
    }

    @Test
    void getBatchDetailsForTeacher_notAssigned_throwsAccessDenied() {
        when(batchTeacherRepository.findByBatch_IdAndTeacherId(1L, 10L)).thenReturn(Optional.empty());

        assertThrows(AccessDeniedException.class,
                () -> teacherBatchService.getBatchDetailsForTeacher(1L, 10L));
    }

    @Test
    void getBatchDetailsForTeacher_success() {
        BatchTeacher secondTeacher = new BatchTeacher();
        secondTeacher.setId(101L);
        secondTeacher.setTeacherId(11L);
        secondTeacher.setBatch(batch);

        BatchResponseDto batchDto = new BatchResponseDto();
        batchDto.setId(1L);
        batchDto.setBatchCode("BATCH-JAVA");

        when(batchTeacherRepository.findByBatch_IdAndTeacherId(1L, 10L))
                .thenReturn(Optional.of(assignment));
        when(batchTeacherRepository.findByBatch_Id(1L))
                .thenReturn(List.of(assignment, secondTeacher));
        when(modelMapper.map(batch, BatchResponseDto.class)).thenReturn(batchDto);
        when(batchEnrollmentRepository.countByBatch_Id(1L)).thenReturn(12L);

        BatchDetailsDto result = teacherBatchService.getBatchDetailsForTeacher(1L, 10L);

        assertNotNull(result);
        assertEquals(2, result.getTeacherCount());
        assertEquals(12, result.getStudentCount());
        assertEquals("BATCH-JAVA", result.getBatchCode());
    }
}

