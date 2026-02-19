package com.batch.repository;

import com.batch.entity.BatchContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BatchContentRepository extends JpaRepository<BatchContent, Long> {
    List<BatchContent> findByBatch_IdOrderByOrderIndexAscIdAsc(Long batchId);
}

