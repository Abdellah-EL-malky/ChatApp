package com.abdellah.chatapp.service;

import com.abdellah.chatapp.dto.UserResponse;
import com.abdellah.chatapp.entity.User;
import com.abdellah.chatapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    public User getByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow();
    }

    public void setOnline(String email, boolean online) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setOnline(online);
            userRepository.save(user);
            // broadcast presence to all connected users
            messagingTemplate.convertAndSend("/topic/presence", toResponse(user));
        });
    }

    public List<UserResponse> searchUsers(String query) {
        return userRepository.findByUsernameContainingIgnoreCase(query)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<UserResponse> getAllOnline() {
        return userRepository.findAll().stream()
            .filter(User::isOnline)
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public UserResponse toResponse(User u) {
        UserResponse r = new UserResponse();
        r.setId(u.getId());
        r.setUsername(u.getUsername());
        r.setEmail(u.getEmail());
        r.setAvatarColor(u.getAvatarColor());
        r.setOnline(u.isOnline());
        return r;
    }
}
