package com.assignment.service;

import com.assignment.dto.ApiResponse;
import com.assignment.dto.UserSummaryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "USERSERVICE")
public interface UserServiceClient {

    @GetMapping("/internal/users/{id}")
    ApiResponse<UserSummaryDto> getUserSummary(@PathVariable Long id);
}
