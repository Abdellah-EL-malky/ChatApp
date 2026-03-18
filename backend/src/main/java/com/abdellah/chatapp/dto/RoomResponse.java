package com.abdellah.chatapp.dto;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
@Data
public class RoomResponse {
    private Long id;
    private String name;
    private String description;
    private boolean isPrivate;
    private UserResponse createdBy;
    private List<UserResponse> members;
    private LocalDateTime createdAt;
    private int unreadCount;
    private MessageResponse lastMessage;
}
