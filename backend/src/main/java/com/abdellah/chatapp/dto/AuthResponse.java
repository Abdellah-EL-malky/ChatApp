package com.abdellah.chatapp.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
@Data @AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long id;
    private String email;
    private String username;
    private String avatarColor;
}
