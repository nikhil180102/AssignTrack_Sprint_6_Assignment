package com.assignment.repository;

import com.assignment.entity.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssignmentSubmissionRepository
        extends JpaRepository<AssignmentSubmission, Long> {

    boolean existsByAssignment_IdAndStudentId(Long assignmentId, Long studentId);

    List<AssignmentSubmission> findByStudentId(Long studentId);

    List<AssignmentSubmission> findByAssignment_IdOrderBySubmittedAtDesc(Long assignmentId);

    long countByAssignment_Id(Long assignmentId);

    void deleteByAssignment_Id(Long assignmentId);

    Optional<AssignmentSubmission>
    findByAssignment_IdAndStudentId(Long assignmentId, Long studentId);
}
