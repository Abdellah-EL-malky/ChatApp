package com.abdellah.chatapp.controller;

import com.abdellah.chatapp.dto.*;
import com.abdellah.chatapp.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    @Autowired private RoomService roomService;

    @GetMapping("/public")
    public List<RoomResponse> getPublic(@AuthenticationPrincipal UserDetails ud) {
        return roomService.getPublicRooms(ud.getUsername());
    }

    @GetMapping("/mine")
    public List<RoomResponse> getMine(@AuthenticationPrincipal UserDetails ud) {
        return roomService.getMyRooms(ud.getUsername());
    }

    @GetMapping("/{id}")
    public RoomResponse getById(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        return roomService.getById(id, ud.getUsername());
    }

    @PostMapping
    public ResponseEntity<RoomResponse> create(@RequestBody RoomRequest req,
                                                @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(roomService.createRoom(req, ud.getUsername()));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<RoomResponse> join(@PathVariable Long id,
                                              @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(roomService.joinRoom(id, ud.getUsername()));
    }
}
