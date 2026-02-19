package com.notification.controller;

import com.notification.dto.NotificationResponse;
import com.notification.entity.NotificationRole;
import com.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/student/notification")
    public ResponseEntity<List<NotificationResponse>> getStudentNotifications(
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(
                userId != null
                        ? notificationService.getForUser(userId)
                        : notificationService.getForRole(NotificationRole.STUDENT)
        );
    }

    @GetMapping("/teacher/notification")
    public ResponseEntity<List<NotificationResponse>> getTeacherNotifications(
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(
                userId != null
                        ? notificationService.getForUser(userId)
                        : notificationService.getForRole(NotificationRole.TEACHER)
        );
    }

    @GetMapping("/admin/notification")
    public ResponseEntity<List<NotificationResponse>> getAdminNotifications(
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(
                userId != null
                        ? notificationService.getForUser(userId)
                        : notificationService.getForRole(NotificationRole.ADMIN)
        );
    }

    @PutMapping("/notification/{id}/read")
    public ResponseEntity<NotificationResponse> markRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markRead(id));
    }

    @DeleteMapping("/notification/clear")
    public ResponseEntity<Void> clear(@RequestParam Long userId) {
        notificationService.clearForUser(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/notification/{id}")
    public ResponseEntity<Void> deleteOne(@PathVariable Long id) {
        notificationService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

