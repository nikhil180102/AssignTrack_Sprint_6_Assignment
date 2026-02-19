package com.assignment.service.student;

import com.assignment.dto.AssignmentSubmitRequest;
import com.assignment.dto.StudentAssignmentDto;
import com.assignment.entity.Assignment;
import com.assignment.entity.AssignmentStatus;
import com.assignment.entity.AssignmentSubmission;
import com.assignment.entity.AssignmentType;
import com.assignment.exception.BadRequestException;
import com.assignment.repository.AssignmentRepository;
import com.assignment.repository.AssignmentSubmissionRepository;
import com.assignment.repository.McqAssignmentRepository;
import com.assignment.repository.McqSubmissionRepository;
import com.assignment.service.BatchServiceGateway;
import com.assignment.service.FileStorageService;
import com.assignment.service.NotificationPublisher;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentAssignmentServiceImpl implements StudentAssignmentService {

    private final AssignmentRepository assignmentRepo;
    private final AssignmentSubmissionRepository submissionRepo;
    private final McqAssignmentRepository mcqAssignmentRepository;
    private final McqSubmissionRepository mcqSubmissionRepository;
    private final BatchServiceGateway batchServiceGateway;
    private final NotificationPublisher notificationPublisher;
    private final FileStorageService fileStorageService;

    @Override
    @Cacheable(
            value = "studentAssignments",
            key = "#studentId",
            unless = "#result == null || #result.isEmpty()"
    )
    public List<StudentAssignmentDto> listAssignments(Long studentId) {
List<Long> batchIds = batchServiceGateway.getStudentBatchIds(studentId);

        return assignmentRepo
                .findByBatchIdInAndStatus(batchIds, AssignmentStatus.PUBLISHED)
                .stream()
                .map(a -> toDto(a, studentId))
                .collect(Collectors.toList());
    }

    @Override
    public void submitAssignment(Long assignmentId, AssignmentSubmitRequest req, Long studentId) {

        Assignment a = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        if (a.getStatus() != AssignmentStatus.PUBLISHED) {
            throw new BadRequestException("Assignment is not available for submission");
        }

        if (submissionRepo.existsByAssignment_IdAndStudentId(assignmentId, studentId)) {
            throw new BadRequestException("Already submitted");
        }

        if (a.getType() == AssignmentType.FILE) {
            throw new BadRequestException("Use file upload endpoint for FILE assignment submission");
        }

        submissionRepo.save(
                AssignmentSubmission.builder()
                        .assignment(a)
                        .studentId(studentId)
                        .submissionContent(req.getSubmissionContent())
                        .submittedAt(LocalDateTime.now())
                        .build()
        );

        notificationPublisher.publish(
                new com.assignment.dto.NotificationEvent(
                        a.getTeacherId(),
                        null,
                        "TEACHER",
                        "IN_APP",
                        "New submission received",
                        "A student submitted \"" + a.getTitle() + "\"."
                )
        );

        evictStudentAssignments(studentId);
    }

    @Override
    public void submitFileAssignment(Long assignmentId, MultipartFile file, Long studentId) {
        Assignment a = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        if (a.getStatus() != AssignmentStatus.PUBLISHED) {
            throw new BadRequestException("Assignment is not available for submission");
        }

        if (a.getType() != AssignmentType.FILE) {
            throw new BadRequestException("This assignment is not FILE type");
        }

        if (submissionRepo.existsByAssignment_IdAndStudentId(assignmentId, studentId)) {
            throw new BadRequestException("Already submitted");
        }

        String storedPath = fileStorageService.storeStudentSubmission(file, assignmentId, studentId);

        submissionRepo.save(
                AssignmentSubmission.builder()
                        .assignment(a)
                        .studentId(studentId)
                        .filePath(storedPath)
                        .submittedAt(LocalDateTime.now())
                        .build()
        );

        notificationPublisher.publish(
                new com.assignment.dto.NotificationEvent(
                        a.getTeacherId(),
                        null,
                        "TEACHER",
                        "IN_APP",
                        "New file submission received",
                        "A student submitted file for \"" + a.getTitle() + "\"."
                )
        );

        evictStudentAssignments(studentId);
    }

    @CacheEvict(value = "studentAssignments", key = "#studentId")
    public void evictStudentAssignments(Long studentId) {
    }
    private StudentAssignmentDto toDto(Assignment assignment, Long studentId) {
        StudentAssignmentDto dto = new StudentAssignmentDto();
        dto.setAssignmentId(assignment.getId());  // Explicit mapping
        dto.setBatchId(assignment.getBatchId());
        dto.setTitle(assignment.getTitle());
        dto.setDescription(assignment.getDescription());
        dto.setType(assignment.getType());
        dto.setMaxMarks(assignment.getMaxMarks());
        if (assignment.getType() == AssignmentType.MCQ) {
            mcqAssignmentRepository.findByAssignment_Id(assignment.getId())
                    .flatMap(mcq -> mcqSubmissionRepository
                            .findByMcqAssignment_IdAndStudentId(mcq.getId(), studentId))
                    .ifPresentOrElse(submission -> {
                        dto.setSubmitted(true);
                        dto.setObtainedMarks(submission.getObtainedMarks());
                        dto.setEvaluatedAt(submission.getSubmittedAt());
                    }, () -> dto.setSubmitted(false));
        } else {
            submissionRepo.findByAssignment_IdAndStudentId(assignment.getId(), studentId)
                    .ifPresentOrElse(submission -> {
                        dto.setSubmitted(true);
                        dto.setObtainedMarks(submission.getObtainedMarks());
                        dto.setFeedback(submission.getFeedback());
                        dto.setEvaluatedAt(submission.getEvaluatedAt());
                    }, () -> dto.setSubmitted(false));
        }
        return dto;
    }

    private boolean isSubmitted(Assignment assignment, Long studentId) {
        if (assignment.getType() == AssignmentType.MCQ) {
            return mcqAssignmentRepository
                    .findByAssignment_Id(assignment.getId())
                    .map(mcq -> mcqSubmissionRepository
                            .existsByMcqAssignment_IdAndStudentId(mcq.getId(), studentId))
                    .orElse(false);
        }

        return submissionRepo.existsByAssignment_IdAndStudentId(assignment.getId(), studentId);
    }
}
