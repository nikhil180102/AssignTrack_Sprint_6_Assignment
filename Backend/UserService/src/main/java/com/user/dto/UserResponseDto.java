package com.user.dto;

import lombok.Data;

@Data
public class UserResponseDto {
    private Long id;
    private String email;
    private String role;
    private boolean active;
    private String firstName;
    private String lastName;
    private String expertise;
    private Integer experienceYears;
    private String certificationFileName;
}

