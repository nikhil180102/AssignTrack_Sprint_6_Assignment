package com.assignment.service.teacher;

import com.assignment.dto.*;
import com.assignment.entity.*;
import com.assignment.exception.BadRequestException;
import com.assignment.exception.ForbiddenException;
import com.assignment.exception.ResourceNotFoundException;
import com.assignment.repository.*;
import com.assignment.service.BatchServiceGateway;
import com.assignment.service.NotificationPublisher;
import com.assignment.service.UserServiceGateway;
import com.assignment.service.student.StudentAssignmentServiceImpl;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;;

@Slf4j
@Service
@RequiredArgsConstructor
public class TeacherMcqAssignmentServiceImpl implements TeacherMcqAssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final McqAssignmentRepository mcqAssignmentRepository;
    private final McqQuestionRepository mcqQuestionRepository;
    private final McqSubmissionRepository mcqSubmissionRepository;
    private final BatchServiceGateway batchServiceGateway;
    private final NotificationPublisher notificationPublisher;
    private final StudentAssignmentServiceImpl studentAssignmentService;
    private final UserServiceGateway userServiceGateway;
    private final ObjectMapper objectMapper;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public McqAssignmentResponseDto createMcqAssignment(
            McqAssignmentCreateRequest request,
            Long teacherId) {
        Boolean valid = batchServiceGateway
                .validateTeacherBatch(teacherId, request.getBatchId());

        if (Boolean.FALSE.equals(valid)) {
            throw new ForbiddenException("Teacher is not assigned to this batch");
        }
        List<McqQuestionCreateDto> questionDtos = request.getQuestions();

        if (questionDtos == null || questionDtos.isEmpty()) {
            throw new BadRequestException("At least one question is required");
        }

        int questionCount = questionDtos.size();
        int marksPerQuestion = request.getMaxMarks() / questionCount;
        Assignment assignment = Assignment.builder()
                .teacherId(teacherId)
                .batchId(request.getBatchId())
                .title(request.getTitle())
                .description(request.getDescription())
                .type(AssignmentType.MCQ)
                .maxMarks(request.getMaxMarks())
                .status(AssignmentStatus.DRAFT)
                .createdAt(LocalDateTime.now())
                .build();

        assignment = assignmentRepository.save(assignment);
        McqAssignment mcqAssignment = McqAssignment.builder()
                .assignment(assignment)
                .passingPercentage(request.getPassingPercentage())
                .showCorrectAnswers(request.getShowCorrectAnswers())
                .timeLimit(request.getTimeLimit())
                .build();

        mcqAssignment = mcqAssignmentRepository.save(mcqAssignment);
        List<McqQuestion> questions = new ArrayList<>();

        int questionNumber = 1;

        for (McqQuestionCreateDto questionDto : questionDtos) {
            try {
                List<McqOptionCreateDto> createOptions = questionDto.getOptions();

                int correctIndex = -1;

                for (int i = 0; i < createOptions.size(); i++) {
                    if (Boolean.TRUE.equals(createOptions.get(i).getIsCorrect())) {
                        if (correctIndex != -1) {
                            throw new BadRequestException(
                                    "Each question must have exactly one correct option");
                        }
                        correctIndex = i;
                    }
                }

                if (correctIndex == -1) {
                    throw new BadRequestException(
                            "Each question must have exactly one correct option");
                }
                List<McqOptionDto> responseOptions = new ArrayList<>();
                for (int i = 0; i < createOptions.size(); i++) {
                    responseOptions.add(
                            new McqOptionDto(i, createOptions.get(i).getText())
                    );
                }

                McqQuestion question = McqQuestion.builder()
                        .mcqAssignment(mcqAssignment)
                        .questionNumber(questionNumber++)
                        .questionText(questionDto.getQuestionText())
                        .marks(marksPerQuestion)
                        .optionsJson(
                                objectMapper.writeValueAsString(responseOptions)
                        )
                        .correctAnswersJson(
                                objectMapper.writeValueAsString(List.of(correctIndex))
                        )
                        .build();

                questions.add(question);

            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to serialize MCQ question data", e);
            }
        }

        mcqQuestionRepository.saveAll(questions);
return buildMcqAssignmentResponse(mcqAssignment, questions, true);
    }

    @Override
    @Transactional
    public void publishMcqAssignment(Long assignmentId, Long teacherId) {
Assignment assignment = getAssignmentAndValidateTeacher(assignmentId, teacherId);

        if (assignment.getStatus() != AssignmentStatus.DRAFT) {
            throw new BadRequestException("Only DRAFT assignments can be published");
        }

        assignment.setStatus(AssignmentStatus.PUBLISHED);
        assignmentRepository.save(assignment);
List<Long> studentIds = batchServiceGateway.getBatchStudentIds(assignment.getBatchId());
        for (Long studentId : studentIds) {
            notificationPublisher.publish(
                    new com.assignment.dto.NotificationEvent(
                            studentId,
                            null,
                            "STUDENT",
                            "IN_APP",
                            "New MCQ published",
                            "MCQ \"" + assignment.getTitle() + "\" has been published."
                    )
            );
            studentAssignmentService.evictStudentAssignments(studentId);
        }
    }

    @Override
    @Transactional
    public void closeMcqAssignment(Long assignmentId, Long teacherId) {
Assignment assignment = getAssignmentAndValidateTeacher(assignmentId, teacherId);

        if (assignment.getStatus() != AssignmentStatus.PUBLISHED) {
            throw new BadRequestException("Only PUBLISHED assignments can be closed");
        }

        assignment.setStatus(AssignmentStatus.CLOSED);
        assignmentRepository.save(assignment);
List<Long> studentIds = batchServiceGateway.getBatchStudentIds(assignment.getBatchId());
        for (Long studentId : studentIds) {
            notificationPublisher.publish(
                    new com.assignment.dto.NotificationEvent(
                            studentId,
                            null,
                            "STUDENT",
                            "IN_APP",
                            "MCQ closed",
                            "MCQ \"" + assignment.getTitle() + "\" has been closed."
                    )
            );
            studentAssignmentService.evictStudentAssignments(studentId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public McqAssignmentResponseDto getMcqAssignment(Long assignmentId, Long teacherId) {
Assignment assignment = getAssignmentAndValidateTeacher(assignmentId, teacherId);

        McqAssignment mcqAssignment = mcqAssignmentRepository.findByAssignment_Id(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("MCQ assignment not found"));

        List<McqQuestion> questions = mcqQuestionRepository
                .findByMcqAssignment_IdOrderByQuestionNumberAsc(mcqAssignment.getId());

        return buildMcqAssignmentResponse(mcqAssignment, questions, true);
    }

    @Override
    @Transactional
    public McqAssignmentResponseDto updateMcqAssignment(
            Long assignmentId,
            McqAssignmentUpdateRequest request,
            Long teacherId) {

        Assignment assignment = getAssignmentAndValidateTeacher(assignmentId, teacherId);

        if (assignment.getStatus() == AssignmentStatus.DELETED) {
            throw new BadRequestException("Only DRAFT or PUBLISHED assignments can be updated");
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
        McqAssignment mcqAssignment = mcqAssignmentRepository.findByAssignment_Id(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("MCQ assignment not found"));

        if (request.getPassingPercentage() != null) {
            mcqAssignment.setPassingPercentage(request.getPassingPercentage());
        }
        if (request.getShowCorrectAnswers() != null) {
            mcqAssignment.setShowCorrectAnswers(request.getShowCorrectAnswers());
        }
        if (request.getTimeLimit() != null) {
            mcqAssignment.setTimeLimit(request.getTimeLimit());
        }

        List<McqQuestionCreateDto> questionDtos = request.getQuestions();
        if (questionDtos != null && !questionDtos.isEmpty()) {
            int questionCount = questionDtos.size();
            int marksPerQuestion = assignment.getMaxMarks() / questionCount;

            mcqQuestionRepository.deleteByMcqAssignment_Id(mcqAssignment.getId());

            List<McqQuestion> questions = new ArrayList<>();
            int questionNumber = 1;

            for (McqQuestionCreateDto questionDto : questionDtos) {
                try {
                    List<McqOptionCreateDto> createOptions = questionDto.getOptions();

                    int correctIndex = -1;
                    for (int i = 0; i < createOptions.size(); i++) {
                        if (Boolean.TRUE.equals(createOptions.get(i).getIsCorrect())) {
                            if (correctIndex != -1) {
                                throw new BadRequestException(
                                        "Each question must have exactly one correct option");
                            }
                            correctIndex = i;
                        }
                    }

                    if (correctIndex == -1) {
                        throw new BadRequestException(
                                "Each question must have exactly one correct option");
                    }

                    List<McqOptionDto> responseOptions = new ArrayList<>();
                    for (int i = 0; i < createOptions.size(); i++) {
                        responseOptions.add(
                                new McqOptionDto(i, createOptions.get(i).getText())
                        );
                    }

                    McqQuestion question = McqQuestion.builder()
                            .mcqAssignment(mcqAssignment)
                            .questionNumber(questionNumber++)
                            .questionText(questionDto.getQuestionText())
                            .marks(marksPerQuestion)
                            .optionsJson(
                                    objectMapper.writeValueAsString(responseOptions)
                            )
                            .correctAnswersJson(
                                    objectMapper.writeValueAsString(List.of(correctIndex))
                            )
                            .build();

                    questions.add(question);

                } catch (JsonProcessingException e) {
                    throw new RuntimeException("Failed to serialize MCQ question data", e);
                }
            }

            mcqQuestionRepository.saveAll(questions);
        }

        assignmentRepository.save(assignment);
        mcqAssignmentRepository.save(mcqAssignment);

        List<McqQuestion> questions = mcqQuestionRepository
                .findByMcqAssignment_IdOrderByQuestionNumberAsc(mcqAssignment.getId());

        return buildMcqAssignmentResponse(mcqAssignment, questions, true);
    }

    @Override
    @Transactional
    public void deleteMcqAssignment(Long assignmentId, Long teacherId) {
        Assignment assignment = getAssignmentAndValidateTeacher(assignmentId, teacherId);

        if (assignment.getStatus() == AssignmentStatus.DELETED) {
            return;
        }

        McqAssignment mcqAssignment = mcqAssignmentRepository.findByAssignment_Id(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("MCQ assignment not found"));

        assignment.setStatus(AssignmentStatus.DELETED);
        assignment.setDeletedAt(LocalDateTime.now());
        assignmentRepository.save(assignment);

        List<Long> studentIds = batchServiceGateway.getBatchStudentIds(assignment.getBatchId());
        for (Long studentId : studentIds) {
            studentAssignmentService.evictStudentAssignments(studentId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<McqSubmissionSummaryDto> getMcqSubmissions(
            Long assignmentId,
            Long teacherId) {

        getAssignmentAndValidateTeacher(assignmentId, teacherId);

        McqAssignment mcqAssignment = mcqAssignmentRepository.findByAssignment_Id(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("MCQ assignment not found"));

        List<McqSubmission> submissions =
                mcqSubmissionRepository.findByMcqAssignment_IdOrderBySubmittedAtDesc(mcqAssignment.getId());

        return submissions.stream()
                .map(submission -> {
                    var user = userServiceGateway.getUserSummary(submission.getStudentId());
                    String fullName = ((user.getFirstName() == null ? "" : user.getFirstName()) + " " +
                            (user.getLastName() == null ? "" : user.getLastName())).trim();
                    if (fullName.isEmpty()) {
                        fullName = "Student #" + submission.getStudentId();
                    }

                    return McqSubmissionSummaryDto.builder()
                            .submissionId(submission.getId())
                            .studentId(submission.getStudentId())
                            .studentName(fullName)
                            .studentEmail(user.getEmail())
                            .obtainedMarks(submission.getObtainedMarks())
                            .totalMarks(submission.getTotalMarks())
                            .percentage(submission.getPercentage())
                            .passed(submission.getPassed())
                            .status("SUBMITTED")
                            .submittedAt(submission.getSubmittedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private Assignment getAssignmentAndValidateTeacher(Long assignmentId, Long teacherId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        if (!assignment.getTeacherId().equals(teacherId)) {
            throw new ForbiddenException("Access denied");
        }

        if (assignment.getStatus() == AssignmentStatus.DELETED) {
            throw new ResourceNotFoundException("Assignment not found");
        }

        if (assignment.getType() != AssignmentType.MCQ) {
            throw new BadRequestException("Assignment is not MCQ type");
        }

        return assignment;
    }

    private McqAssignmentResponseDto buildMcqAssignmentResponse(
            McqAssignment mcqAssignment,
            List<McqQuestion> questions,
            boolean includeCorrectAnswers) {

        Assignment assignment = mcqAssignment.getAssignment();

        List<McqQuestionDto> questionDtos = questions.stream()
                .map(q -> parseQuestion(q, includeCorrectAnswers))
                .collect(Collectors.toList());

        McqAssignmentResponseDto dto = modelMapper.map(mcqAssignment, McqAssignmentResponseDto.class);
        dto.setAssignmentId(assignment.getId());
        dto.setBatchId(assignment.getBatchId());
        dto.setTitle(assignment.getTitle());
        dto.setDescription(assignment.getDescription());
        dto.setMaxMarks(assignment.getMaxMarks());
        dto.setStatus(assignment.getStatus());
        dto.setCreatedAt(assignment.getCreatedAt());
        dto.setQuestions(questionDtos);
        dto.setTotalQuestions(questions.size());

        return dto;
    }

    private McqQuestionDto parseQuestion(McqQuestion question, boolean includeCorrectAnswers) {
        try {
            List<McqOptionDto> options = objectMapper.readValue(
                    question.getOptionsJson(),
                    new TypeReference<List<McqOptionDto>>() {}
            );

            List<Integer> correctAnswers = null;
            if (includeCorrectAnswers) {
                correctAnswers = objectMapper.readValue(
                        question.getCorrectAnswersJson(),
                        new TypeReference<List<Integer>>() {}
                );
            }

            McqQuestionDto dto = modelMapper.map(question, McqQuestionDto.class);
            dto.setOptions(options);
            dto.setCorrectAnswers(correctAnswers);

            return dto;

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse question data", e);
        }
    }

}
