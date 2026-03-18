package com.abdellah.chatapp.controller;

import com.abdellah.chatapp.dto.*;
import com.abdellah.chatapp.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
public class MessageController {
    @Autowired private MessageService messageService;

    // REST: get history
    @GetMapping("/api/rooms/{roomId}/messages")
    public List<MessageResponse> getHistory(@PathVariable Long roomId) {
        return messageService.getHistory(roomId);
    }

    // WebSocket: send message via STOMP
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageRequest req, Principal principal) {
        messageService.sendMessage(req, principal.getName());
    }
}
