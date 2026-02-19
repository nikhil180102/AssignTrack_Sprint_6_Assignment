package com.user.dto;

import lombok.Data;

@Data
public class UserProfileDto {
    private Long id;
    private String email;
    private String role;
    private String firstName;
    private String lastName;
    private String expertise;
    private Integer experienceYears;
    private String certificationFileName;
}
