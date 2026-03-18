package com.abdellah.chatapp.service;

import com.abdellah.chatapp.dto.NotificationResponse;
import com.abdellah.chatapp.entity.Notification;
import com.abdellah.chatapp.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired private NotificationRepository notificationRepository;
    @Autowired private RoomService roomService;

    public List<NotificationResponse> getUnread(String email) {
        // We'd need userId, let's use a different approach via user service
        return List.of(); // will be called with userId directly
    }

    public List<NotificationResponse> getUnreadByUserId(Long userId) {
        return notificationRepository.findByUserIdAndReadFalse(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markRoomAsRead(Long roomId, Long userId) {
        notificationRepository.findByUserIdAndRoomIdAndReadFalse(userId, roomId)
            .forEach(n -> {
                n.setRead(true);
                notificationRepository.save(n);
            });
    }

    private NotificationResponse toResponse(Notification n) {
        NotificationResponse r = new NotificationResponse();
        r.setId(n.getId());
        r.setRoomId(n.getRoom().getId());
        r.setRoomName(n.getRoom().getName());
        r.setMessage(roomService.toMessageResponse(n.getMessage()));
        r.setRead(n.isRead());
        r.setCreatedAt(n.getCreatedAt());
        return r;
    }
}
