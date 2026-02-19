package com.batch.repository;

import com.batch.entity.BatchEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatchEnrollmentRepository extends JpaRepository<BatchEnrollment, Long> {

    boolean existsByBatch_IdAndStudentId(Long batchId, Long studentId);

    List<BatchEnrollment> findByStudentId(Long studentId);

    Long countByBatch_Id(Long batchId);

    @Query("SELECT DISTINCT be.studentId FROM BatchEnrollment be WHERE be.batch.id = :batchId")
    List<Long> findStudentIdsByBatchId(@Param("batchId") Long batchId);
}
