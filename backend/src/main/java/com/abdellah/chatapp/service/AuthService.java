package com.abdellah.chatapp.service;

import com.abdellah.chatapp.dto.*;
import com.abdellah.chatapp.entity.User;
import com.abdellah.chatapp.repository.UserRepository;
import com.abdellah.chatapp.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private AuthenticationManager authManager;

    private static final String[] AVATAR_COLORS = {
        "#10b981","#3b82f6","#8b5cf6","#f59e0b","#ef4444","#06b6d4","#ec4899","#84cc16"
    };

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already in use");
        if (userRepository.existsByUsername(req.getUsername()))
            throw new RuntimeException("Username already taken");

        String color = AVATAR_COLORS[(int)(Math.random() * AVATAR_COLORS.length)];
        User user = User.builder()
            .email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .username(req.getUsername())
            .avatarColor(color)
            .online(false)
            .build();
        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getUsername(), user.getAvatarColor());
    }

    public AuthResponse login(AuthRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        User user = userRepository.findByEmail(req.getEmail()).orElseThrow();
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getUsername(), user.getAvatarColor());
    }
}
