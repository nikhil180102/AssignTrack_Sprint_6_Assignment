package com.batch.repository;

import com.batch.entity.StudentContentProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentContentProgressRepository extends JpaRepository<StudentContentProgress, Long> {
    List<StudentContentProgress> findByStudentIdAndContent_Batch_Id(Long studentId, Long batchId);
    Optional<StudentContentProgress> findByStudentIdAndContent_Id(Long studentId, Long contentId);
}

