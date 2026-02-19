package com.assignment.repository;

import com.assignment.entity.Assignment;
import com.assignment.entity.AssignmentStatus;
import com.assignment.entity.AssignmentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    @Query("""
            SELECT a FROM Assignment a
            WHERE a.teacherId = :teacherId
              AND a.status <> com.assignment.entity.AssignmentStatus.DELETED
              AND (:search IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:type IS NULL OR a.type = :type)
              AND (:status IS NULL OR a.status = :status)
            """)
    Page<Assignment> findTeacherAssignmentsPage(
            @Param("teacherId") Long teacherId,
            @Param("search") String search,
            @Param("type") AssignmentType type,
            @Param("status") AssignmentStatus status,
            Pageable pageable
    );

    List<Assignment> findByBatchIdInAndStatus(
            List<Long> batchIds,
            AssignmentStatus status
    );
}
