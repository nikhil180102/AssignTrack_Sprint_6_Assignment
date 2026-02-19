package com.user.service;

import com.user.dto.ChangePasswordRequest;
import com.user.dto.UpdateProfileRequest;
import com.user.dto.UserProfileDto;
import com.user.dto.UserResponseDto;
import com.user.entity.*;
import com.user.exception.ResourceNotFoundException;
import com.user.repository.StudentRepository;
import com.user.repository.TeacherRepository;
import com.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;
import java.util.List;

@Service
@Transactional
@AllArgsConstructor
public class UserServiceImpl implements UserService {
    private static final Set<String> ALLOWED_EXPERTISE = Set.of(
            "JAVA",
            "SPRING_BOOT",
            "MICROSERVICES",
            "REACT",
            "NODE_JS",
            "DATA_STRUCTURES",
            "DATABASES",
            "DEVOPS"
    );

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final TeacherRepository teacherRepository;
    private final NotificationPublisher notificationPublisher;
    private final TeacherDocumentStorageService teacherDocumentStorageService;

    @Override
    public UserResponseDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id " + id));

        return toDto(user);
    }

    @Override
    public UserResponseDto createStudent(String email, String password, String firstName, String lastName
    ) {

        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(Role.STUDENT);
        user.setActive(true);

        user = userRepository.save(user);
        Student student = new Student();
        student.setUser(user);
        student.setFirstName(firstName);
        student.setLastName(lastName);

        studentRepository.save(student);

        return toDto(user);
    }

    @Override
    public UserProfileDto getMyProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());

        if (user.getRole() == Role.TEACHER) {
            Teacher teacher = teacherRepository.findByUser_Id(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));
            dto.setFirstName(teacher.getFirstName());
            dto.setLastName(teacher.getLastName());
            dto.setExpertise(teacher.getExpertise());
            dto.setExperienceYears(teacher.getExperienceYears());
            dto.setCertificationFileName(teacher.getCertificationFileName());
        } else if (user.getRole() == Role.STUDENT) {
            Student student = studentRepository.findByUser_Id(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
            dto.setFirstName(student.getFirstName());
            dto.setLastName(student.getLastName());
        }

        return dto;
    }

    @Override
    public UserProfileDto updateMyProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.TEACHER) {
            Teacher teacher = teacherRepository.findByUser_Id(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));
            if (request.getFirstName() != null) {
                teacher.setFirstName(request.getFirstName());
            }
            if (request.getLastName() != null) {
                teacher.setLastName(request.getLastName());
            }
            if (request.getExpertise() != null) {
                teacher.setExpertise(normalizeExpertise(request.getExpertise()));
            }
            if (request.getExperienceYears() != null) {
                teacher.setExperienceYears(validateExperienceYears(request.getExperienceYears()));
            }
            teacherRepository.save(teacher);
        } else if (user.getRole() == Role.STUDENT) {
            Student student = studentRepository.findByUser_Id(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
            if (request.getFirstName() != null) {
                student.setFirstName(request.getFirstName());
            }
            if (request.getLastName() != null) {
                student.setLastName(request.getLastName());
            }
            studentRepository.save(student);
        }

        return getMyProfile(userId);
    }

    @Override
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public UserResponseDto registerTeacher(
            String email,
            String password,
            String firstName,
            String lastName,
            String expertise,
            Integer experienceYears,
            MultipartFile certificationFile
    ) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(Role.TEACHER);
        user.setActive(true);
        user.setApprovalStatus(ApprovalStatus.PENDING);

        user = userRepository.save(user);

        Teacher teacher = new Teacher();
        teacher.setUser(user);
        teacher.setFirstName(firstName);
        teacher.setLastName(lastName);
        teacher.setExpertise(normalizeExpertise(expertise));
        teacher.setExperienceYears(validateExperienceYears(experienceYears));

        var storedDocument = teacherDocumentStorageService.store(user.getId(), certificationFile);
        teacher.setCertificationFilePath(storedDocument.storedPath());
        teacher.setCertificationFileName(storedDocument.originalFileName());

        teacherRepository.save(teacher);

        return toDto(user);
    }

    @Override
    public void approveTeacher(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.TEACHER) {
            throw new IllegalArgumentException("User is not a teacher");
        }

        user.setApprovalStatus(ApprovalStatus.APPROVED);
        user.setActive(true);

        userRepository.save(user);

        notificationPublisher.publish(
                new com.user.dto.NotificationEvent(
                        user.getId(),
                        user.getEmail(),
                        user.getRole().name(),
                        "EMAIL",
                        "Teacher account approved",
                        "Your teacher account has been approved. You can log in now."
                )
        );
    }

@Override
    public void rejectTeacher(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.TEACHER) {
            throw new IllegalArgumentException("User is not a teacher");
        }

        user.setApprovalStatus(ApprovalStatus.REJECTED);
        user.setActive(false);

        userRepository.save(user);

        notificationPublisher.publish(
                new com.user.dto.NotificationEvent(
                        user.getId(),
                        user.getEmail(),
                        user.getRole().name(),
                        "EMAIL",
                        "Teacher account rejected",
                        "Your teacher account request was rejected. Contact admin for details."
                )
        );
    }

@Override
    public List<UserResponseDto> getTeachersByStatus(ApprovalStatus status) {

        return userRepository
                .findByRoleAndApprovalStatus(Role.TEACHER, status)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public UserProfileDto updateTeacherProfileWithDocument(
            Long userId,
            String firstName,
            String lastName,
            String expertise,
            Integer experienceYears,
            MultipartFile certificationFile
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole() != Role.TEACHER) {
            throw new IllegalArgumentException("Only teacher profile supports this update");
        }

        Teacher teacher = teacherRepository.findByUser_Id(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        if (firstName != null) teacher.setFirstName(firstName);
        if (lastName != null) teacher.setLastName(lastName);
        if (expertise != null) teacher.setExpertise(normalizeExpertise(expertise));
        if (experienceYears != null) teacher.setExperienceYears(validateExperienceYears(experienceYears));
        if (certificationFile != null && !certificationFile.isEmpty()) {
            var storedDocument = teacherDocumentStorageService.store(userId, certificationFile);
            teacher.setCertificationFilePath(storedDocument.storedPath());
            teacher.setCertificationFileName(storedDocument.originalFileName());
        }

        teacherRepository.save(teacher);
        return getMyProfile(userId);
    }

    private UserResponseDto toDto(User user) {
        UserResponseDto dto = modelMapper.map(user, UserResponseDto.class);
        dto.setRole(user.getRole().name());
        if (user.getRole() == Role.TEACHER) {
            teacherRepository.findByUser_Id(user.getId()).ifPresent(t -> {
                dto.setFirstName(t.getFirstName());
                dto.setLastName(t.getLastName());
                dto.setExpertise(t.getExpertise());
                dto.setExperienceYears(t.getExperienceYears());
                dto.setCertificationFileName(t.getCertificationFileName());
            });
        } else if (user.getRole() == Role.STUDENT) {
            studentRepository.findByUser_Id(user.getId()).ifPresent(s -> {
                dto.setFirstName(s.getFirstName());
                dto.setLastName(s.getLastName());
            });
        }
        return dto;
    }

    private String normalizeExpertise(String expertise) {
        if (expertise == null || expertise.isBlank()) {
            return null;
        }
        String normalized = expertise.trim().toUpperCase();
        if (!ALLOWED_EXPERTISE.contains(normalized)) {
            throw new IllegalArgumentException("Invalid expertise value");
        }
        return normalized;
    }

    private Integer validateExperienceYears(Integer years) {
        if (years == null) {
            return null;
        }
        if (years < 0 || years > 40) {
            throw new IllegalArgumentException("Experience years must be between 0 and 40");
        }
        return years;
    }
}
