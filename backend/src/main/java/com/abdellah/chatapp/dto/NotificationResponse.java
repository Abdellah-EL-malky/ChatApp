package com.abdellah.chatapp.dto;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class NotificationResponse {
    private Long id;
    private Long roomId;
    private String roomName;
    private MessageResponse message;
    private boolean read;
    private LocalDateTime createdAt;
}
