package com.assignment.service.teacher;

import com.assignment.dto.AssignmentCreateRequest;
import com.assignment.dto.AssignmentUpdateRequest;
import com.assignment.dto.FileDownloadDto;
import com.assignment.dto.SubmissionResponseDto;
import com.assignment.dto.UserSummaryDto;
import com.assignment.dto.AssignmentResponseDto;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TeacherTextAssignmentServiceImplTest {

    @Mock private AssignmentRepository assignmentRepo;
    @Mock private BatchServiceGateway batchServiceGateway;
    @Mock private NotificationPublisher notificationPublisher;
    @Mock private StudentAssignmentServiceImpl studentAssignmentService;
    @Mock private UserServiceGateway userServiceGateway;
    @Mock private FileStorageService fileStorageService;
    @Mock private AssignmentSubmissionRepository submissionRepo;
    @Mock private McqSubmissionRepository mcqSubmissionRepository;
    @Mock private ModelMapper modelMapper;

    @InjectMocks
    private TeacherTextAssignmentServiceImpl teacherTextAssignmentService;

    private Assignment assignment;

    @BeforeEach
    void setUp() {
        assignment = Assignment.builder()
                .id(1L)
                .teacherId(3L)
                .batchId(10L)
                .title("Text Assignment")
                .description("Explain REST")
                .type(AssignmentType.TEXT)
                .maxMarks(20)
                .status(AssignmentStatus.DRAFT)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createAssignment_success() {
        AssignmentCreateRequest request = new AssignmentCreateRequest();
        request.setBatchId(10L);
        request.setTitle("Text Assignment");
        request.setDescription("Explain REST");
        request.setType(AssignmentType.TEXT);
        request.setMaxMarks(20);

        AssignmentResponseDto mapped = new AssignmentResponseDto();
        mapped.setId(1L);
        mapped.setTitle("Text Assignment");

        when(batchServiceGateway.validateTeacherBatch(3L, 10L)).thenReturn(true);
        when(assignmentRepo.save(any(Assignment.class))).thenReturn(assignment);
        when(modelMapper.map(any(Assignment.class), eq(AssignmentResponseDto.class))).thenReturn(mapped);

        AssignmentResponseDto result = teacherTextAssignmentService.createAssignment(request, 3L);

        assertEquals("Text Assignment", result.getTitle());
        verify(assignmentRepo).save(any(Assignment.class));
    }

    @Test
    void createAssignment_teacherNotAssigned_throwsForbidden() {
        AssignmentCreateRequest request = new AssignmentCreateRequest();
        request.setBatchId(10L);

        when(batchServiceGateway.validateTeacherBatch(3L, 10L)).thenReturn(false);

        assertThrows(ForbiddenException.class,
                () -> teacherTextAssignmentService.createAssignment(request, 3L));
    }

    @Test
    void publishAssignment_success() {
        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));
        when(batchServiceGateway.getBatchStudentIds(10L)).thenReturn(List.of(11L, 12L));

        teacherTextAssignmentService.publishAssignment(1L, 3L);

        assertEquals(AssignmentStatus.PUBLISHED, assignment.getStatus());
        verify(notificationPublisher, times(2)).publish(any());
        verify(studentAssignmentService, times(2)).evictStudentAssignments(any());
    }

    @Test
    void publishAssignment_forbiddenWhenTeacherMismatch() {
        assignment.setTeacherId(99L);
        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));

        assertThrows(ForbiddenException.class,
                () -> teacherTextAssignmentService.publishAssignment(1L, 3L));
    }

    @Test
    void publishAssignment_invalidStatus_throwsBadRequest() {
        assignment.setStatus(AssignmentStatus.PUBLISHED);
        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));

        assertThrows(BadRequestException.class,
                () -> teacherTextAssignmentService.publishAssignment(1L, 3L));
    }

    @Test
    void closeAssignment_success() {
        assignment.setStatus(AssignmentStatus.PUBLISHED);
        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));
        when(batchServiceGateway.getBatchStudentIds(10L)).thenReturn(List.of(11L, 12L));

        teacherTextAssignmentService.closeAssignment(1L, 3L);

        assertEquals(AssignmentStatus.CLOSED, assignment.getStatus());
        verify(notificationPublisher, times(2)).publish(any());
        verify(studentAssignmentService, times(2)).evictStudentAssignments(any());
    }

    @Test
    void closeAssignment_invalidStatus_throwsBadRequest() {
        assignment.setStatus(AssignmentStatus.DRAFT);
        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));

        assertThrows(BadRequestException.class,
                () -> teacherTextAssignmentService.closeAssignment(1L, 3L));
    }

    @Test
    void getAssignment_fileType_success() {
        assignment.setType(AssignmentType.FILE);
        assignment.setStatus(AssignmentStatus.PUBLISHED);
        AssignmentResponseDto dto = new AssignmentResponseDto();

        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));
        when(modelMapper.map(assignment, AssignmentResponseDto.class)).thenReturn(dto);
        when(batchServiceGateway.getBatchCode(10L)).thenReturn("BATCH-JAVA");
        when(submissionRepo.countByAssignment_Id(1L)).thenReturn(2L);

        AssignmentResponseDto result = teacherTextAssignmentService.getAssignment(1L, 3L);

        assertNotNull(result);
        assertEquals("BATCH-JAVA", result.getBatchCode());
        assertEquals(2, result.getTotalSubmissions());
    }

    @Test
    void getAssignment_mcqType_throwsBadRequest() {
        assignment.setType(AssignmentType.MCQ);
        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));

        assertThrows(BadRequestException.class,
                () -> teacherTextAssignmentService.getAssignment(1L, 3L));
    }

    @Test
    void updateAssignment_deleted_throwsBadRequest() {
        assignment.setStatus(AssignmentStatus.DELETED);
        AssignmentUpdateRequest req = new AssignmentUpdateRequest();
        req.setTitle("Updated");
        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));

        assertThrows(BadRequestException.class,
                () -> teacherTextAssignmentService.updateAssignment(1L, req, 3L));
    }

    @Test
    void deleteAssignment_success_setsDeletedAndEvicts() {
        assignment.setType(AssignmentType.FILE);
        assignment.setStatus(AssignmentStatus.PUBLISHED);
        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));
        when(batchServiceGateway.getBatchStudentIds(10L)).thenReturn(List.of(11L, 12L));

        teacherTextAssignmentService.deleteAssignment(1L, 3L);

        assertEquals(AssignmentStatus.DELETED, assignment.getStatus());
        verify(assignmentRepo).save(assignment);
        verify(studentAssignmentService, times(2)).evictStudentAssignments(any());
    }

    @Test
    void getSubmissions_fileType_includesFileNameAndStudentDetails() {
        assignment.setType(AssignmentType.FILE);
        assignment.setStatus(AssignmentStatus.PUBLISHED);
        AssignmentSubmission submission = AssignmentSubmission.builder()
                .id(100L)
                .assignment(assignment)
                .studentId(11L)
                .filePath("uploads/1/11/answer.zip")
                .submittedAt(LocalDateTime.now())
                .build();
        UserSummaryDto user = new UserSummaryDto();
        user.setId(11L);
        user.setFirstName("Nikhil");
        user.setLastName("Kolate");
        user.setEmail("nikhil@test.com");

        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));
        when(submissionRepo.findByAssignment_IdOrderBySubmittedAtDesc(1L))
                .thenReturn(List.of(submission));
        when(userServiceGateway.getUserSummary(11L)).thenReturn(user);
        when(fileStorageService.extractFileName("uploads/1/11/answer.zip")).thenReturn("answer.zip");

        List<SubmissionResponseDto> result = teacherTextAssignmentService.getSubmissions(1L, 3L);

        assertEquals(1, result.size());
        assertEquals("Nikhil Kolate", result.get(0).getStudentName());
        assertEquals("answer.zip", result.get(0).getFileName());
    }

    @Test
    void downloadSubmissionFile_success() {
        assignment.setType(AssignmentType.FILE);
        assignment.setStatus(AssignmentStatus.PUBLISHED);
        AssignmentSubmission submission = AssignmentSubmission.builder()
                .id(100L)
                .assignment(assignment)
                .studentId(11L)
                .filePath("uploads/1/11/answer.zip")
                .build();
        ByteArrayResource resource = new ByteArrayResource("dummy".getBytes());

        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));
        when(submissionRepo.findByAssignment_IdAndStudentId(1L, 11L))
                .thenReturn(Optional.of(submission));
        when(fileStorageService.loadAsResource("uploads/1/11/answer.zip"))
                .thenReturn(resource);
        when(fileStorageService.extractFileName("uploads/1/11/answer.zip"))
                .thenReturn("answer.zip");
        when(fileStorageService.detectContentType("uploads/1/11/answer.zip"))
                .thenReturn("application/zip");

        FileDownloadDto dto = teacherTextAssignmentService.downloadSubmissionFile(1L, 11L, 3L);

        assertEquals("answer.zip", dto.getFileName());
        assertEquals("application/zip", dto.getContentType());
        assertEquals(resource, dto.getResource());
    }

    @Test
    void downloadSubmissionFile_notFileType_throwsBadRequest() {
        assignment.setType(AssignmentType.TEXT);
        when(assignmentRepo.findById(1L)).thenReturn(Optional.of(assignment));

        assertThrows(BadRequestException.class,
                () -> teacherTextAssignmentService.downloadSubmissionFile(1L, 11L, 3L));
    }

    @Test
    void myAssignments_mapsSubmissionCountsForText() {
        assignment.setType(AssignmentType.TEXT);
        assignment.setStatus(AssignmentStatus.PUBLISHED);
        AssignmentResponseDto mapped = new AssignmentResponseDto();

        when(assignmentRepo.findTeacherAssignmentsPage(eq(3L), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of(assignment), PageRequest.of(0, 10), 1));
        when(modelMapper.map(assignment, AssignmentResponseDto.class)).thenReturn(mapped);
        when(batchServiceGateway.getBatchCode(10L)).thenReturn("BATCH-JAVA");
        when(submissionRepo.countByAssignment_Id(1L)).thenReturn(4L);

        var page = teacherTextAssignmentService.myAssignments(
                3L, null, null, null, PageRequest.of(0, 10));

        assertEquals(1, page.getContent().size());
        assertEquals(4, page.getContent().get(0).getTotalSubmissions());
        assertEquals("BATCH-JAVA", page.getContent().get(0).getBatchCode());
    }
}
