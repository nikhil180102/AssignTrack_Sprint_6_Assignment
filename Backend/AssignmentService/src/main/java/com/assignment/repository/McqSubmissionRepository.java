package com.assignment.repository;

import com.assignment.entity.McqSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface McqSubmissionRepository extends JpaRepository<McqSubmission, Long> {

    Optional<McqSubmission> findByMcqAssignment_IdAndStudentId(Long mcqAssignmentId, Long studentId);

    boolean existsByMcqAssignment_IdAndStudentId(Long mcqAssignmentId, Long studentId);

    List<McqSubmission> findByMcqAssignment_IdOrderBySubmittedAtDesc(Long mcqAssignmentId);

    long countByMcqAssignment_Assignment_Id(Long assignmentId);
}
