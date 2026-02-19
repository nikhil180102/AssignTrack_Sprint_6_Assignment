package com.user.service;

import com.user.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class TeacherDocumentStorageService {

    private static final Set<String> ALLOWED_EXT = Set.of("pdf", "doc", "docx");
    private static final long MAX_BYTES = 10L * 1024 * 1024;

    private final Path root;

    public TeacherDocumentStorageService(
            @Value("${teacher.docs.dir:uploads/teacher-docs}") String rootDir
    ) {
        this.root = Paths.get(rootDir).toAbsolutePath().normalize();
    }

    public StoredTeacherDocument store(Long userId, MultipartFile file) {
        validate(file);
        String original = file.getOriginalFilename() == null ? "document" : file.getOriginalFilename();
        String ext = getExtension(original);
        String generated = "teacher-" + userId + "-" + UUID.randomUUID() + "." + ext;

        try {
            Files.createDirectories(root);
            Path destination = root.resolve(generated).normalize();
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, destination, StandardCopyOption.REPLACE_EXISTING);
            }
            return new StoredTeacherDocument(destination.toString(), original);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store certification document", e);
        }
    }

    public Path resolve(String storedPath) {
        if (storedPath == null || storedPath.isBlank()) {
            throw new BadRequestException("Certification document not found");
        }
        Path path = Paths.get(storedPath).toAbsolutePath().normalize();
        if (!path.startsWith(root)) {
            throw new BadRequestException("Invalid document path");
        }
        return path;
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Certification document is required");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new BadRequestException("Certification document must be <= 10MB");
        }
        String ext = getExtension(file.getOriginalFilename());
        if (!ALLOWED_EXT.contains(ext)) {
            throw new BadRequestException("Only PDF, DOC, DOCX documents are allowed");
        }
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int idx = filename.lastIndexOf('.');
        if (idx < 0 || idx == filename.length() - 1) return "";  //Both false → skip
        return filename.substring(idx + 1).toLowerCase();
    }

    public record StoredTeacherDocument(String storedPath, String originalFileName) {

    }
}

