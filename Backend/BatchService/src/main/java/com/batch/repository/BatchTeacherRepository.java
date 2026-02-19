package com.batch.repository;

import com.batch.entity.BatchTeacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatchTeacherRepository extends JpaRepository<BatchTeacher, Long> {

    boolean existsByBatch_IdAndTeacherId(Long batchId, Long teacherId);

    List<BatchTeacher> findByTeacherId(Long teacherId);

    List<BatchTeacher> findByBatch_Id(Long batchId);

    Optional<BatchTeacher> findByBatch_IdAndTeacherId(Long batchId, Long teacherId);
}