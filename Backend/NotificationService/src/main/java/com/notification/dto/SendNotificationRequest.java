package com.notification.dto;

import com.notification.entity.NotificationChannel;
import com.notification.entity.NotificationRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SendNotificationRequest {

    @NotNull
    private Long userId;

    private String email;

    @NotNull
    private NotificationRole role;

    @NotNull
    private NotificationChannel channel;

    @NotBlank
    private String title;

    @NotBlank
    private String message;
}
