package com.assignment.service;

import com.assignment.exception.BadRequestException;
import com.assignment.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Slf4j
public class FileStorageService {

    private final Path rootDir;
    private final long maxFileSizeBytes;
    private final Set<String> allowedExtensions;

    public FileStorageService(
            @Value("${assignment.file.upload-dir:uploads/assignment-submissions}") String uploadDir,
            @Value("${assignment.file.max-size-bytes:10485760}") long maxFileSizeBytes,
            @Value("${assignment.file.allowed-extensions:pdf,doc,docx,zip}") String allowedExtensions) {
        this.rootDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.maxFileSizeBytes = maxFileSizeBytes;
        this.allowedExtensions = Stream.of(allowedExtensions.split(","))
                .map(String::trim)
                .map(s -> s.toLowerCase(Locale.ROOT))
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }

    public String storeStudentSubmission(MultipartFile file, Long assignmentId, Long studentId) {
        validateFile(file);

        String originalName = file.getOriginalFilename() == null
                ? "submission"
                : file.getOriginalFilename();
        String safeOriginalName = sanitizeFileName(originalName);
        String extension = getExtension(safeOriginalName);

        String generatedName = UUID.randomUUID() + "_" + safeOriginalName;
        Path submissionDir = rootDir.resolve(String.valueOf(assignmentId)).resolve(String.valueOf(studentId));
        Path target = submissionDir.resolve(generatedName);

        try {
            Files.createDirectories(submissionDir);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
return target.toString();
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file: " + ex.getMessage(), ex);
        }
    }

    public Resource loadAsResource(String storedPath) {
        Path path = Paths.get(storedPath).toAbsolutePath().normalize();
        Resource resource = new FileSystemResource(path.toFile());
        if (!resource.exists() || !resource.isReadable()) {
            throw new ResourceNotFoundException("Submitted file not found");
        }
        return resource;
    }

    public String detectContentType(String storedPath) {
        try {
            String detected = Files.probeContentType(Paths.get(storedPath));
            return detected != null ? detected : "application/octet-stream";
        } catch (IOException ex) {
            return "application/octet-stream";
        }
    }

    public String extractFileName(String storedPath) {
        Path fileName = Paths.get(storedPath).getFileName();
        return fileName != null ? fileName.toString() : "submission";
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }
        if (file.getSize() > maxFileSizeBytes) {
            throw new BadRequestException("File exceeds maximum allowed size");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new BadRequestException("Invalid file name");
        }

        String extension = getExtension(originalName);
        if (!allowedExtensions.contains(extension.toLowerCase(Locale.ROOT))) {
            throw new BadRequestException(
                    "Unsupported file type. Allowed: " + String.join(", ", allowedExtensions));
        }
    }

    private String getExtension(String fileName) {
        int idx = fileName.lastIndexOf('.');
        if (idx < 0 || idx == fileName.length() - 1) {
            throw new BadRequestException("File extension is required");
        }
        return fileName.substring(idx + 1);
    }

    private String sanitizeFileName(String fileName) {
        String baseName = Paths.get(fileName).getFileName().toString();
        return baseName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}

