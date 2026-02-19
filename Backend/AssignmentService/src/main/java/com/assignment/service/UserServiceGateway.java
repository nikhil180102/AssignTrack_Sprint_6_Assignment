package com.assignment.service;

import com.assignment.dto.UserSummaryDto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceGateway {

    private final UserServiceClient userServiceClient;

    @CircuitBreaker(name = "userService", fallbackMethod = "getUserSummaryFallback")
    @Retry(name = "userService")
    public UserSummaryDto getUserSummary(Long userId) {
        return userServiceClient.getUserSummary(userId).getData();
    }

    private UserSummaryDto getUserSummaryFallback(Long userId, Throwable ex) {
        UserSummaryDto fallback = new UserSummaryDto();
        fallback.setId(userId);
        fallback.setFirstName("Student");
        fallback.setLastName("#" + userId);
        return fallback;
    }
}
