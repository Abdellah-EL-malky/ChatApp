package com.abdellah.chatapp.config;

import com.abdellah.chatapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import java.util.Collections;

@Configuration
public class UserDetailsServiceConfig {
    @Autowired private UserRepository userRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return email -> {
            com.abdellah.chatapp.entity.User u = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            return new org.springframework.security.core.userdetails.User(
                u.getEmail(), u.getPassword(), Collections.emptyList());
        };
    }
}
