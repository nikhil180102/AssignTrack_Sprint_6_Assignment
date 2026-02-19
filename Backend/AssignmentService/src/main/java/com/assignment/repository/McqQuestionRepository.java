package com.assignment.repository;

import com.assignment.entity.McqQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface McqQuestionRepository extends JpaRepository<McqQuestion, Long> {

    List<McqQuestion> findByMcqAssignment_IdOrderByQuestionNumberAsc(Long mcqAssignmentId);

    void deleteByMcqAssignment_Id(Long mcqAssignmentId);
}