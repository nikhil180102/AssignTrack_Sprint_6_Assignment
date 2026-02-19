package com.assignment.service.student;

import com.assignment.dto.*;
import com.assignment.entity.*;
import com.assignment.exception.BadRequestException;
import com.assignment.exception.ForbiddenException;
import com.assignment.exception.ResourceNotFoundException;
import com.assignment.repository.*;
import com.assignment.service.BatchServiceGateway;
import com.assignment.service.NotificationPublisher;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentMcqServiceImpl implements StudentMcqService {

    private final AssignmentRepository assignmentRepository;
    private final McqAssignmentRepository mcqAssignmentRepository;
    private final McqQuestionRepository mcqQuestionRepository;
    private final McqSubmissionRepository mcqSubmissionRepository;
    private final BatchServiceGateway batchServiceGateway;
    private final NotificationPublisher notificationPublisher;
    private final ObjectMapper objectMapper;
    private final ModelMapper modelMapper;
    @Override
    public McqAssignmentResponseDto getMcqAssignmentForStudent(
            Long assignmentId,
            Long studentId) {

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        if (assignment.getStatus() != AssignmentStatus.PUBLISHED) {
            throw new BadRequestException("Assignment not available");
        }

        List<Long> batchIds = batchServiceGateway.getStudentBatchIds(studentId);
        if (batchIds == null || !batchIds.contains(assignment.getBatchId())) {
            throw new ForbiddenException("You are not enrolled in this batch");
        }

        McqAssignment mcq = mcqAssignmentRepository
                .findByAssignment_Id(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("MCQ assignment not found"));

        List<McqQuestion> questions =
                mcqQuestionRepository
                        .findByMcqAssignment_IdOrderByQuestionNumberAsc(mcq.getId());

        McqAssignmentResponseDto response = new McqAssignmentResponseDto();
        modelMapper.map(assignment, response);

        response.setPassingPercentage(mcq.getPassingPercentage());
        response.setShowCorrectAnswers(mcq.getShowCorrectAnswers());
        response.setTimeLimit(mcq.getTimeLimit());
        response.setTotalQuestions(questions.size());

        response.setQuestions(
                questions.stream()
                        .map(this::mapQuestionForStudent)
                        .toList()
        );

        return response;
    }

    @Override
    public McqSubmissionResponseDto submitMcqAssignment(
            Long assignmentId,
            McqSubmissionRequest request,
            Long studentId) {

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        if (assignment.getStatus() != AssignmentStatus.PUBLISHED) {
            throw new BadRequestException("Assignment not open for submission");
        }

        McqAssignment mcq = mcqAssignmentRepository
                .findByAssignment_Id(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("MCQ assignment not found"));

        if (mcqSubmissionRepository
                .existsByMcqAssignment_IdAndStudentId(mcq.getId(), studentId)) {
            throw new BadRequestException("Assignment already submitted");
        }

        List<McqQuestion> questions =
                mcqQuestionRepository
                        .findByMcqAssignment_IdOrderByQuestionNumberAsc(mcq.getId());

        EvaluationSummary summary = evaluateMcqDetailed(questions, request);
        int obtainedMarks = summary.obtainedMarks();

        double percentage =
                (obtainedMarks * 100.0) / assignment.getMaxMarks();

        boolean passed =
                percentage >= mcq.getPassingPercentage();

        McqSubmission submission = saveSubmission(
                mcq, studentId, request, assignment, obtainedMarks, percentage, passed
        );

        notificationPublisher.publish(
                new com.assignment.dto.NotificationEvent(
                        assignment.getTeacherId(),
                        null,
                        "TEACHER",
                        "IN_APP",
                        "New MCQ submission",
                        "A student submitted \"" + assignment.getTitle() + "\"."
                )
        );

        McqSubmissionResponseDto dto = modelMapper.map(submission, McqSubmissionResponseDto.class);
        dto.setAssignmentId(assignment.getId());
        dto.setAssignmentTitle(assignment.getTitle());
        dto.setTotalMarks(assignment.getMaxMarks());
        dto.setObtainedMarks(obtainedMarks);
        dto.setPercentage(percentage);
        dto.setPassed(passed);
        dto.setSubmittedAt(submission.getSubmittedAt());
        dto.setTimeTaken(submission.getTimeTaken());
        dto.setCorrectCount(summary.correctCount());
        dto.setIncorrectCount(summary.incorrectCount());
        dto.setTotalQuestions(questions.size());
        return dto;
    }

    @Override
    public McqSubmissionResponseDto getMcqSubmissionResult(
            Long assignmentId,
            Long studentId) {

        McqAssignment mcq = mcqAssignmentRepository
                .findByAssignment_Id(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("MCQ assignment not found"));

        McqSubmission submission =
                mcqSubmissionRepository
                        .findByMcqAssignment_IdAndStudentId(mcq.getId(), studentId)
                        .orElseThrow(() -> new ResourceNotFoundException("Result not found"));

        List<McqQuestion> questions =
                mcqQuestionRepository
                        .findByMcqAssignment_IdOrderByQuestionNumberAsc(mcq.getId());

        List<McqAnswerDto> answers = parseAnswersJson(submission.getAnswersJson());
        EvaluationSummary summary = evaluateMcqDetailed(questions, answers);

        McqSubmissionResponseDto dto = modelMapper.map(submission, McqSubmissionResponseDto.class);
        dto.setAssignmentId(assignmentId);
        dto.setAssignmentTitle(
                assignmentRepository.findById(assignmentId)
                        .map(Assignment::getTitle)
                        .orElse(null));
        dto.setTotalMarks(submission.getTotalMarks());
        dto.setObtainedMarks(submission.getObtainedMarks());
        dto.setPercentage(submission.getPercentage());
        dto.setPassed(submission.getPassed());
        dto.setSubmittedAt(submission.getSubmittedAt());
        dto.setTimeTaken(submission.getTimeTaken());
        dto.setCorrectCount(summary.correctCount());
        dto.setIncorrectCount(summary.incorrectCount());
        dto.setTotalQuestions(questions.size());
        return dto;
    }

    private McqQuestionDto mapQuestionForStudent(McqQuestion q) {
        try {
            return new McqQuestionDto(
                    q.getId(),
                    q.getQuestionNumber(),
                    q.getQuestionText(),
                    q.getMarks(),
                    objectMapper.readValue(
                            q.getOptionsJson(),
                            new TypeReference<>() {}),
                    null // ❌ no correct answers
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse MCQ options", e);
        }
    }

    private EvaluationSummary evaluateMcqDetailed(
            List<McqQuestion> questions,
            McqSubmissionRequest request) {

        List<McqAnswerDto> submittedAnswers = request.getAnswers() == null
                ? List.of()
                : request.getAnswers();
        Map<Integer, McqAnswerDto> answerByQuestion = submittedAnswers.stream()
                .filter(a -> a != null && a.getQuestionNumber() != null)
                .collect(Collectors.toMap(McqAnswerDto::getQuestionNumber, a -> a, (a, b) -> a));

        Map<Integer, McqQuestion> questionMap =
                questions.stream()
                        .collect(Collectors.toMap(McqQuestion::getQuestionNumber, q -> q));

        int marks = 0;
        int correctCount = 0;

        for (McqQuestion q : questions) {
            McqAnswerDto ans = answerByQuestion.get(q.getQuestionNumber());
            if (ans == null) {
                continue; // no answer for this question = 0 marks
            }

            try {
                List<Integer> correctIndexes =
                        objectMapper.readValue(
                                q.getCorrectAnswersJson(),
                                new TypeReference<>() {});

                if (correctIndexes == null || correctIndexes.isEmpty()) {
                    throw new BadRequestException(
                            "No correct option configured for question " + ans.getQuestionNumber());
                }

                List<McqOptionDto> options =
                        objectMapper.readValue(
                                q.getOptionsJson(),
                                new TypeReference<>() {});

                int selectedIndex = ans.getSelectedOptionIndex() != null
                        ? ans.getSelectedOptionIndex()
                        : -1;

                if (options == null || selectedIndex < 0 || selectedIndex >= options.size()) {
                    continue; // invalid option = 0 marks for this question
                }

                if (correctIndexes.contains(selectedIndex)) {
                    marks += q.getMarks();
                    correctCount++;
                }

            } catch (JsonProcessingException e) {
                throw new RuntimeException("Evaluation failed", e);
            }
        }

        int incorrectCount = questions.size() - correctCount;
        return new EvaluationSummary(marks, correctCount, incorrectCount);
    }

    private EvaluationSummary evaluateMcqDetailed(
            List<McqQuestion> questions,
            List<McqAnswerDto> answers) {
        McqSubmissionRequest req = new McqSubmissionRequest();
        req.setAnswers(answers);
        return evaluateMcqDetailed(questions, req);
    }

    private List<McqAnswerDto> parseAnswersJson(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse submitted answers", e);
        }
    }

    private record EvaluationSummary(
            int obtainedMarks,
            int correctCount,
            int incorrectCount
    ) {}

    private McqSubmission saveSubmission(
            McqAssignment mcq,
            Long studentId,
            McqSubmissionRequest request,
            Assignment assignment,
            int obtainedMarks,
            double percentage,
            boolean passed) {

        try {
            return mcqSubmissionRepository.save(
                    McqSubmission.builder()
                            .mcqAssignment(mcq)
                            .studentId(studentId)
                            .answersJson(
                                    objectMapper.writeValueAsString(request.getAnswers()))
                            .totalMarks(assignment.getMaxMarks())
                            .obtainedMarks(obtainedMarks)
                            .percentage(percentage)
                            .passed(passed)
                            .submittedAt(LocalDateTime.now())
                            .timeTaken(request.getTimeTaken())
                            .build()
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to save submission", e);
        }
    }
}
