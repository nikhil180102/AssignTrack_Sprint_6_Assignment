package com.assignment.service.student;

import com.assignment.dto.AssignmentSubmitRequest;
import com.assignment.dto.StudentAssignmentDto;
import com.assignment.entity.Assignment;
import com.assignment.entity.AssignmentStatus;
import com.assignment.entity.AssignmentType;
import com.assignment.exception.BadRequestException;
import com.assignment.repository.AssignmentRepository;
import com.assignment.repository.AssignmentSubmissionRepository;
import com.assignment.repository.McqAssignmentRepository;
import com.assignment.repository.McqSubmissionRepository;
import com.assignment.service.BatchServiceGateway;
import com.assignment.service.FileStorageService;
import com.assignment.service.NotificationPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentAssignmentServiceImplTest {

    @Mock private AssignmentRepository assignmentRepo;
    @Mock private AssignmentSubmissionRepository submissionRepo;
    @Mock private McqAssignmentRepository mcqAssignmentRepository;
    @Mock private McqSubmissionRepository mcqSubmissionRepository;
    @Mock private BatchServiceGateway batchServiceGateway;
    @Mock private NotificationPublisher notificationPublisher;
    @Mock private FileStorageService fileStorageService;

    @InjectMocks
    private StudentAssignmentServiceImpl studentAssignmentService;

    private Assignment assignment;

    @BeforeEach
    void setUp() {
        assignment = Assignment.builder()
                .id(1L)
                .teacherId(3L)
                .batchId(10L)
                .title("Spring Boot Assignment")
                .description("Build REST APIs")
                .type(AssignmentType.TEXT)
                .maxMarks(100)
                .status(AssignmentStatus.PUBLISHED)
                .build();
    }

    @Test
    void listAssignments_success() {
        when(batchServiceGateway.getStudentBatchIds(11L)).thenReturn(List.of(10L));
        when(assignmentRepo.findByBatchIdInAndStatus(List.of(10L), AssignmentStatus.PUBLISHED))
                .thenReturn(List.of(assignment));
        when(submissionRepo.findByAssignment_IdAndStudentId(1L, 11L))
                .thenReturn(Optional.empty());

        List<StudentAssignmentDto> result = studentAssignmentService.listAssignments(11L);

        assertEquals(1, result.size());
        assertEquals("Spring Boot Assignment", result.get(0).getTitle());
        assertEquals(false, result.get(0).getSubmitted());
    }

    @Test
    void submitAssignment_success() {
        AssignmentSubmitRequest request = new AssignmentSubmitRequest();
        request.setSubmissionContent("My solution");

        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));
        when(submissionRepo.existsByAssignment_IdAndStudentId(1L, 11L)).thenReturn(false);

        studentAssignmentService.submitAssignment(1L, request, 11L);

        verify(submissionRepo).save(any());
        verify(notificationPublisher).publish(any());
    }

    @Test
    void submitAssignment_notPublished_throwsBadRequest() {
        assignment.setStatus(AssignmentStatus.CLOSED);
        AssignmentSubmitRequest request = new AssignmentSubmitRequest();
        request.setSubmissionContent("My solution");

        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));

        assertThrows(BadRequestException.class,
                () -> studentAssignmentService.submitAssignment(1L, request, 11L));
    }

    @Test
    void submitAssignment_alreadySubmitted_throwsBadRequest() {
        AssignmentSubmitRequest request = new AssignmentSubmitRequest();
        request.setSubmissionContent("My solution");

        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));
        when(submissionRepo.existsByAssignment_IdAndStudentId(1L, 11L)).thenReturn(true);

        assertThrows(BadRequestException.class,
                () -> studentAssignmentService.submitAssignment(1L, request, 11L));
    }

    @Test
    void submitAssignment_fileType_throwsBadRequest() {
        assignment.setType(AssignmentType.FILE);
        AssignmentSubmitRequest request = new AssignmentSubmitRequest();
        request.setSubmissionContent("My solution");

        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));
        when(submissionRepo.existsByAssignment_IdAndStudentId(1L, 11L)).thenReturn(false);

        assertThrows(BadRequestException.class,
                () -> studentAssignmentService.submitAssignment(1L, request, 11L));
    }

    @Test
    void submitFileAssignment_success() {
        assignment.setType(AssignmentType.FILE);
        MockMultipartFile file = new MockMultipartFile(
                "file", "solution.pdf", "application/pdf", "dummy".getBytes()
        );

        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));
        when(submissionRepo.existsByAssignment_IdAndStudentId(1L, 11L)).thenReturn(false);
        when(fileStorageService.storeStudentSubmission(any(), eq(1L), eq(11L)))
                .thenReturn("uploads/1/11/solution.pdf");

        studentAssignmentService.submitFileAssignment(1L, file, 11L);

        verify(fileStorageService).storeStudentSubmission(any(), eq(1L), eq(11L));
        verify(submissionRepo).save(any());
        verify(notificationPublisher).publish(any());
    }

    @Test
    void submitFileAssignment_notPublished_throwsBadRequest() {
        assignment.setType(AssignmentType.FILE);
        assignment.setStatus(AssignmentStatus.CLOSED);
        MockMultipartFile file = new MockMultipartFile(
                "file", "solution.pdf", "application/pdf", "dummy".getBytes()
        );

        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));

        assertThrows(BadRequestException.class,
                () -> studentAssignmentService.submitFileAssignment(1L, file, 11L));
    }

    @Test
    void submitFileAssignment_nonFileType_throwsBadRequest() {
        assignment.setType(AssignmentType.TEXT);
        MockMultipartFile file = new MockMultipartFile(
                "file", "solution.pdf", "application/pdf", "dummy".getBytes()
        );

        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));

        assertThrows(BadRequestException.class,
                () -> studentAssignmentService.submitFileAssignment(1L, file, 11L));
    }

    @Test
    void submitFileAssignment_alreadySubmitted_throwsBadRequest() {
        assignment.setType(AssignmentType.FILE);
        MockMultipartFile file = new MockMultipartFile(
                "file", "solution.pdf", "application/pdf", "dummy".getBytes()
        );

        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));
        when(submissionRepo.existsByAssignment_IdAndStudentId(1L, 11L)).thenReturn(true);

        assertThrows(BadRequestException.class,
                () -> studentAssignmentService.submitFileAssignment(1L, file, 11L));
    }

    @Test
    void listAssignments_emptyWhenNoBatches() {
        when(batchServiceGateway.getStudentBatchIds(11L)).thenReturn(List.of());
        when(assignmentRepo.findByBatchIdInAndStatus(List.of(), AssignmentStatus.PUBLISHED))
                .thenReturn(List.of());

        List<StudentAssignmentDto> result = studentAssignmentService.listAssignments(11L);
        assertEquals(0, result.size());
    }
}
