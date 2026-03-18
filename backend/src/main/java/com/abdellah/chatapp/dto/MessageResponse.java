package com.abdellah.chatapp.dto;
import lombok.Data;
import java.time.LocalDateTime;
@Data
public class MessageResponse {
    private Long id;
    private String content;
    private UserResponse sender;
    private Long roomId;
    private LocalDateTime createdAt;
}
