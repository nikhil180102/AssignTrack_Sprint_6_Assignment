package com.assignment.dto;

import lombok.Data;

@Data
public class UserSummaryDto {
    private Long id;
    private String email;
    private String role;
    private String firstName;
    private String lastName;
}
