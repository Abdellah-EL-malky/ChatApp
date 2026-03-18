package com.abdellah.chatapp.dto;

import lombok.Data;

@Data
public class RoomRequest {
    private String name;
    private String description;
    private Boolean privateDm;
    private Long targetUserId;
}