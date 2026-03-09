package com.abdellah.chatapp.config;

import com.abdellah.chatapp.entity.User;
import com.abdellah.chatapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("demo@chatapp.com")) {
            userRepository.save(User.builder()
                .email("demo@chatapp.com")
                .password(passwordEncoder.encode("demo1234"))
                .username("demo")
                .avatarColor("#10b981")
                .online(false)
                .build());
            System.out.println("✅ Demo user created: demo@chatapp.com / demo1234");
        }
    }
}