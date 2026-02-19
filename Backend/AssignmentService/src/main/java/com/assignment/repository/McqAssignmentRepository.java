package com.assignment.repository;

import com.assignment.entity.McqAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface McqAssignmentRepository extends JpaRepository<McqAssignment, Long> {

    Optional<McqAssignment> findByAssignment_Id(Long assignmentId);
}