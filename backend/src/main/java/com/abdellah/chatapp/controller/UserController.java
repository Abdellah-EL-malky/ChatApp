package com.abdellah.chatapp.controller;

import com.abdellah.chatapp.dto.UserResponse;
import com.abdellah.chatapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired private UserService userService;

    @GetMapping("/search")
    public List<UserResponse> search(@RequestParam String q) {
        return userService.searchUsers(q);
    }

    @GetMapping("/online")
    public List<UserResponse> online() {
        return userService.getAllOnline();
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal UserDetails ud) {
        return userService.toResponse(userService.getByEmail(ud.getUsername()));
    }
}
