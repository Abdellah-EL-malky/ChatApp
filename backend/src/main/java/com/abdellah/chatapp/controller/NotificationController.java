package com.abdellah.chatapp.controller;

import com.abdellah.chatapp.dto.NotificationResponse;
import com.abdellah.chatapp.entity.User;
import com.abdellah.chatapp.service.NotificationService;
import com.abdellah.chatapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired private NotificationService notificationService;
    @Autowired private UserService userService;

    @GetMapping
    public List<NotificationResponse> getUnread(@AuthenticationPrincipal UserDetails ud) {
        User user = userService.getByEmail(ud.getUsername());
        return notificationService.getUnreadByUserId(user.getId());
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> count(@AuthenticationPrincipal UserDetails ud) {
        User user = userService.getByEmail(ud.getUsername());
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread(user.getId())));
    }

    @PostMapping("/read/room/{roomId}")
    public ResponseEntity<Void> markRoomRead(@PathVariable Long roomId,
                                              @AuthenticationPrincipal UserDetails ud) {
        User user = userService.getByEmail(ud.getUsername());
        notificationService.markRoomAsRead(roomId, user.getId());
        return ResponseEntity.ok().build();
    }
}
