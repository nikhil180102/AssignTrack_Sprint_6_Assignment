package com.user.controller;

import com.user.dto.ApiResponse;
import com.user.dto.UserProfileDto;
import com.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfileDto>> getUserSummary(@PathVariable Long id) {
        UserProfileDto dto = userService.getMyProfile(id);
        return ResponseEntity.ok(ApiResponse.success("User summary fetched", dto));
    }
}
