package com.assignment.service.teacher;

import com.assignment.dto.*;
import com.assignment.entity.Assignment;
import com.assignment.entity.AssignmentStatus;
import com.assignment.entity.AssignmentSubmission;
import com.assignment.entity.AssignmentType;
import com.assignment.exception.BadRequestException;
import com.assignment.exception.ForbiddenException;
import com.assignment.exception.ResourceNotFoundException;
import com.assignment.repository.AssignmentRepository;
import com.assignment.repository.AssignmentSubmissionRepository;
import com.assignment.repository.McqSubmissionRepository;
import com.assignment.service.BatchServiceGateway;
import com.assignment.service.FileStorageService;
import com.assignment.service.NotificationPublisher;
import com.assignment.service.UserServiceGateway;
import com.assignment.service.student.StudentAssignmentServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherTextAssignmentServiceImpl implements TeacherTextAssignmentService {

    private final AssignmentRepository assignmentRepo;
    private final BatchServiceGateway batchServiceGateway;
    private final NotificationPublisher notificationPublisher;
    private final StudentAssignmentServiceImpl studentAssignmentService;
    private final UserServiceGateway userServiceGateway;
    private final AssignmentSubmissionRepository submissionRepo;
    private final McqSubmissionRepository mcqSubmissionRepository;
    private final ModelMapper modelMapper;
    private final FileStorageService fileStorageService;

    @Override
    public AssignmentResponseDto createAssignment(
            AssignmentCreateRequest req,
            Long teacherId) {

        Boolean valid =
                batchServiceGateway.validateTeacherBatch(
                        teacherId, req.getBatchId());

        if (Boolean.FALSE.equals(valid)) {
            throw new ForbiddenException(
                    "Teacher is not assigned to this batch");
        }

        Assignment assignment = Assignment.builder()
                .teacherId(teacherId)
                .batchId(req.getBatchId())
                .title(req.getTitle())
                .description(req.getDescription())
                .type(req.getType())
                .maxMarks(req.getMaxMarks())
                .status(AssignmentStatus.DRAFT)
                .createdAt(LocalDateTime.now())
                .build();

        assignmentRepo.save(assignment);

        return modelMapper.map(
                assignment, AssignmentResponseDto.class);
    }

    @Override
    public void publishAssignment(Long id, Long teacherId) {

        Assignment assignment = assignmentRepo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Assignment not found"));

        if (!assignment.getTeacherId().equals(teacherId)) {
            throw new ForbiddenException("Access denied");
        }

        if (assignment.getStatus() != AssignmentStatus.DRAFT) {
            throw new BadRequestException("Only DRAFT assignments can be published");
        }

        assignment.setStatus(AssignmentStatus.PUBLISHED);
        assignmentRepo.save(assignment);

        List<Long> studentIds = batchServiceGateway.getBatchStudentIds(assignment.getBatchId());
        for (Long studentId : studentIds) {
            notificationPublisher.publish(
                    new NotificationEvent(
                            studentId,
                            null,
                            "STUDENT",
                            "IN_APP",
                            "New assignment published",
                            "Assignment \"" + assignment.getTitle() + "\" has been published."
                    )
            );
            studentAssignmentService.evictStudentAssignments(studentId);
        }
    }

    @Override
    public void closeAssignment(Long id, Long teacherId) {

        Assignment assignment = assignmentRepo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Assignment not found"));

        if (!assignment.getTeacherId().equals(teacherId)) {
            throw new ForbiddenException("Access denied");
        }

        if (assignment.getStatus() != AssignmentStatus.PUBLISHED) {
            throw new BadRequestException("Only PUBLISHED assignments can be closed");
        }

        assignment.setStatus(AssignmentStatus.CLOSED);
        assignmentRepo.save(assignment);

        List<Long> studentIds = batchServiceGateway.getBatchStudentIds(assignment.getBatchId());
        for (Long studentId : studentIds) {
            notificationPublisher.publish(
                    new com.assignment.dto.NotificationEvent(
                            studentId,
                            null,
                            "STUDENT",
                            "IN_APP",
                            "Assignment closed",
                            "Assignment \"" + assignment.getTitle() + "\" has been closed."
                    )
            );
            studentAssignmentService.evictStudentAssignments(studentId);
        }
    }

    @Override
    public Page<AssignmentResponseDto> myAssignments(
            Long teacherId,
            String search,
            AssignmentType type,
            AssignmentStatus status,
            Pageable pageable) {

        String searchTerm = (search == null || search.isBlank()) ? null : search.trim();

        return assignmentRepo.findTeacherAssignmentsPage(
                        teacherId,
                        searchTerm,
                        type,
                        status,
                        pageable)
                .map(a -> {
                    AssignmentResponseDto dto = modelMapper.map(
                            a, AssignmentResponseDto.class);
                    dto.setBatchCode(batchServiceGateway.getBatchCode(a.getBatchId()));
                    long totalSubmissions;
                    if (a.getType() == AssignmentType.MCQ) {
                        totalSubmissions =
                                mcqSubmissionRepository
                                        .countByMcqAssignment_Assignment_Id(a.getId());
                    } else {
                        totalSubmissions =
                                submissionRepo.countByAssignment_Id(a.getId());
                    }
                    dto.setTotalSubmissions((int) totalSubmissions);
                    return dto;
                });
    }

    @Override
    public AssignmentResponseDto getAssignment(Long assignmentId, Long teacherId) {
        Assignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Assignment not found"));

        if (!assignment.getTeacherId().equals(teacherId)) {
            throw new ForbiddenException("Access denied");
        }

        if (assignment.getStatus() == AssignmentStatus.DELETED) {
            throw new ResourceNotFoundException("Assignment not found");
        }

        if (assignment.getType() == AssignmentType.MCQ) {
            throw new BadRequestException("Use MCQ endpoints for MCQ assignments");
        }

        AssignmentResponseDto dto =
                modelMapper.map(assignment, AssignmentResponseDto.class);
        dto.setBatchCode(batchServiceGateway.getBatchCode(assignment.getBatchId()));

        long totalSubmissions =
                submissionRepo.countByAssignment_Id(assignmentId);
        dto.setTotalSubmissions((int) totalSubmissions);

        return dto;
    }

    @Override
    public AssignmentResponseDto updateAssignment(
            Long assignmentId,
            AssignmentUpdateRequest request,
            Long teacherId) {

        Assignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Assignment not found"));

        if (!assignment.getTeacherId().equals(teacherId)) {
            throw new ForbiddenException("Access denied");
        }

        if (assignment.getType() == AssignmentType.MCQ) {
            throw new BadRequestException("Use MCQ endpoints for MCQ assignments");
        }

        if (assignment.getStatus() == AssignmentStatus.DELETED) {
            throw new BadRequestException(
                    "Only DRAFT or PUBLISHED assignments can be updated");
        }

        if (request.getTitle() != null) {
            assignment.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            assignment.setDescription(request.getDescription());
        }
        if (request.getMaxMarks() != null) {
            assignment.setMaxMarks(request.getMaxMarks());
        }
        assignmentRepo.save(assignment);

        AssignmentResponseDto dto = modelMapper.map(assignment, AssignmentResponseDto.class);
        dto.setBatchCode(batchServiceGateway.getBatchCode(assignment.getBatchId()));
        return dto;
    }

    @Override
    public void deleteAssignment(Long assignmentId, Long teacherId) {
        Assignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Assignment not found"));

        if (!assignment.getTeacherId().equals(teacherId)) {
            throw new ForbiddenException("Access denied");
        }

        if (assignment.getType() == AssignmentType.MCQ) {
            throw new BadRequestException("Use MCQ endpoints for MCQ assignments");
        }

        if (assignment.getStatus() == AssignmentStatus.DELETED) {
            return;
        }

        assignment.setStatus(AssignmentStatus.DELETED);
        assignment.setDeletedAt(LocalDateTime.now());
        assignmentRepo.save(assignment);

        List<Long> studentIds = batchServiceGateway.getBatchStudentIds(assignment.getBatchId());
        for (Long studentId : studentIds) {
            studentAssignmentService.evictStudentAssignments(studentId);
        }
    }

    @Override
    public List<SubmissionResponseDto> getSubmissions(Long assignmentId, Long teacherId) {
        Assignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Assignment not found"));

        if (!assignment.getTeacherId().equals(teacherId)) {
            throw new ForbiddenException("Access denied");
        }

        if (assignment.getStatus() == AssignmentStatus.DELETED) {
            throw new ResourceNotFoundException("Assignment not found");
        }

        if (assignment.getType() == AssignmentType.MCQ) {
            throw new BadRequestException("Use MCQ endpoints for MCQ assignments");
        }

        List<AssignmentSubmission> submissions =
                submissionRepo.findByAssignment_IdOrderBySubmittedAtDesc(assignmentId);

        return submissions.stream()
                .map(submission -> {
                    var user = userServiceGateway.getUserSummary(submission.getStudentId());
                    String fullName = ((user.getFirstName() == null ? "" : user.getFirstName()) + " " +
                            (user.getLastName() == null ? "" : user.getLastName())).trim();
                    if (fullName.isEmpty()) {
                        fullName = "Student #" + submission.getStudentId();
                    }

                    return SubmissionResponseDto.builder()
                            .id(submission.getId())
                            .studentId(submission.getStudentId())
                            .studentName(fullName)
                            .studentEmail(user.getEmail())
                            .score(submission.getObtainedMarks())
                            .maxMarks(assignment.getMaxMarks())
                            .status(submission.getObtainedMarks() != null ? "EVALUATED" : "PENDING")
                            .submittedAt(submission.getSubmittedAt())
                            .submissionContent(submission.getSubmissionContent())
                            .fileName(submission.getFilePath() != null
                                    ? fileStorageService.extractFileName(submission.getFilePath())
                                    : null)
                            .feedback(submission.getFeedback())
                            .evaluatedAt(submission.getEvaluatedAt())
                            .build();
                })
                .toList();
    }

    @Override
    public FileDownloadDto downloadSubmissionFile(Long assignmentId, Long studentId, Long teacherId) {
        Assignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        if (!assignment.getTeacherId().equals(teacherId)) {
            throw new ForbiddenException("Access denied");
        }

        if (assignment.getType() != AssignmentType.FILE) {
            throw new BadRequestException("Download is available only for FILE assignments");
        }

        if (assignment.getStatus() == AssignmentStatus.DELETED) {
            throw new ResourceNotFoundException("Assignment not found");
        }

        AssignmentSubmission submission = submissionRepo
                .findByAssignment_IdAndStudentId(assignmentId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        if (submission.getFilePath() == null || submission.getFilePath().isBlank()) {
            throw new ResourceNotFoundException("No file submitted");
        }

        var resource = fileStorageService.loadAsResource(submission.getFilePath());
        var fileName = fileStorageService.extractFileName(submission.getFilePath());
        var contentType = fileStorageService.detectContentType(submission.getFilePath());
        return new FileDownloadDto(resource, fileName, contentType);
    }

    @Override
    public void evaluateTextAssignment(
            Long assignmentId,
            Long studentId,
            AssignmentEvaluationRequest request,
            Long teacherId) {

        Assignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Assignment not found"));

        if (!assignment.getTeacherId().equals(teacherId)) {
            throw new ForbiddenException("Access denied");
        }

        if (assignment.getType() == AssignmentType.MCQ) {
            throw new BadRequestException(
                    "Only TEXT/FILE assignments can be evaluated here");
        }

        if (request.getObtainedMarks() < 0 ||
                request.getObtainedMarks() > assignment.getMaxMarks()) {
            throw new BadRequestException(
                    "Marks must be between 0 and " + assignment.getMaxMarks());
        }

        AssignmentSubmission submission =
                submissionRepo.findByAssignment_IdAndStudentId(
                                assignmentId, studentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Student has not submitted this assignment"));

        submission.setObtainedMarks(request.getObtainedMarks());
        submission.setFeedback(request.getFeedback());
        submission.setEvaluatedAt(LocalDateTime.now());

        submissionRepo.save(submission);
    }
}
