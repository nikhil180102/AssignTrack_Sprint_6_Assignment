package com.assignment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.core.io.Resource;

@Data
@AllArgsConstructor
public class FileDownloadDto {
    private Resource resource;
    private String fileName;
    private String contentType;
}

