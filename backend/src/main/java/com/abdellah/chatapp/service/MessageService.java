package com.abdellah.chatapp.service;

import com.abdellah.chatapp.dto.MessageRequest;
import com.abdellah.chatapp.dto.MessageResponse;
import com.abdellah.chatapp.entity.*;
import com.abdellah.chatapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired private MessageRepository messageRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private UserService userService;
    @Autowired private RoomService roomService;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    public List<MessageResponse> getHistory(Long roomId) {
        return messageRepository.findByRoomIdOrderByCreatedAtAsc(roomId)
            .stream().map(roomService::toMessageResponse).collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse sendMessage(MessageRequest req, String senderEmail) {
        User sender = userService.getByEmail(senderEmail);
        Room room = roomRepository.findById(req.getRoomId()).orElseThrow();

        Message message = Message.builder()
            .content(req.getContent())
            .sender(sender)
            .room(room)
            .build();
        message = messageRepository.save(message);

        MessageResponse response = roomService.toMessageResponse(message);

        // Broadcast via WebSocket to all subscribers of this room
        messagingTemplate.convertAndSend("/topic/room/" + room.getId(), response);

        // Create notifications for all other members
        Message finalMessage = message;
        if (room.getMembers() != null) {
            room.getMembers().stream()
                .filter(u -> !u.getId().equals(sender.getId()))
                .forEach(member -> {
                    Notification notif = Notification.builder()
                        .user(member)
                        .room(room)
                        .message(finalMessage)
                        .read(false)
                        .build();
                    notificationRepository.save(notif);

                    // Push notification to specific user
                    NotificationPayload payload = new NotificationPayload();
                    payload.setRoomId(room.getId());
                    payload.setRoomName(room.getName());
                    payload.setMessage(response);
                    messagingTemplate.convertAndSendToUser(
                        member.getEmail(), "/queue/notifications", payload);
                });
        }

        return response;
    }

    // Inner DTO for WS notification payload
    public static class NotificationPayload {
        private Long roomId;
        private String roomName;
        private MessageResponse message;
        public Long getRoomId() { return roomId; }
        public void setRoomId(Long roomId) { this.roomId = roomId; }
        public String getRoomName() { return roomName; }
        public void setRoomName(String roomName) { this.roomName = roomName; }
        public MessageResponse getMessage() { return message; }
        public void setMessage(MessageResponse message) { this.message = message; }
    }
}
