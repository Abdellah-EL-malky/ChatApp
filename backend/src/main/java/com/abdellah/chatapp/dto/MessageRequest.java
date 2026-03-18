package com.abdellah.chatapp.dto;
import lombok.Data;
@Data
public class MessageRequest {
    private String content;
    private Long roomId;
}
