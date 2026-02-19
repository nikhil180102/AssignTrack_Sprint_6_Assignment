package com.batch.controller;

import com.batch.repository.BatchEnrollmentRepository;
import com.batch.repository.BatchRepository;
import com.batch.repository.BatchTeacherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/internal/batches")
@RequiredArgsConstructor
public class InternalBatchController {

    private final BatchTeacherRepository batchTeacherRepository;
    private final BatchEnrollmentRepository batchEnrollmentRepository;
    private final BatchRepository batchRepository;

    @GetMapping("/teacher/{teacherId}/validate/{batchId}")
    public Boolean validateTeacherBatch(
            @PathVariable Long teacherId,
            @PathVariable Long batchId) {
        boolean exists = batchTeacherRepository.existsByBatch_IdAndTeacherId(batchId, teacherId);
        return exists;
    }

    @GetMapping("/student/{studentId}")
    @Transactional(readOnly = true)
    public List<Long> getStudentBatchIds(@PathVariable Long studentId) {
List<Long> batchIds = batchEnrollmentRepository.findByStudentId(studentId)
                .stream()
                .map(enrollment -> enrollment.getBatch().getId())
                .collect(Collectors.toList());

        return batchIds;
    }

    @GetMapping("/{batchId}/students")
    @Transactional(readOnly = true)
    public List<Long> getBatchStudentIds(@PathVariable Long batchId) {
        List<Long> studentIds = batchEnrollmentRepository.findStudentIdsByBatchId(batchId);
        return studentIds;
    }

    @GetMapping("/{batchId}/code")
    @Transactional(readOnly = true)
    public String getBatchCode(@PathVariable Long batchId) {
        return batchRepository.findById(batchId)
                .map(batch -> batch.getBatchCode() != null ? batch.getBatchCode() : ("BATCH-" + batchId))
                .orElse("BATCH-" + batchId);
    }
}
