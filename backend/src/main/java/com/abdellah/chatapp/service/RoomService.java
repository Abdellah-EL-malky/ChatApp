package com.abdellah.chatapp.service;

import com.abdellah.chatapp.dto.*;
import com.abdellah.chatapp.entity.*;
import com.abdellah.chatapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoomService {

    @Autowired private RoomRepository roomRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private MessageRepository messageRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private UserService userService;

    public List<RoomResponse> getPublicRooms(String email) {
        User me = userService.getByEmail(email);
        return roomRepository.findByIsPrivateFalse()
            .stream().map(r -> toResponse(r, me.getId()))
            .collect(Collectors.toList());
    }

    public List<RoomResponse> getMyRooms(String email) {
        User me = userService.getByEmail(email);
        return roomRepository.findByMemberId(me.getId())
            .stream().map(r -> toResponse(r, me.getId()))
            .collect(Collectors.toList());
    }

    @Transactional
    public RoomResponse createRoom(RoomRequest req, String email) {
        User me = userService.getByEmail(email);

        if (Boolean.TRUE.equals(req.getPrivateDm()) && req.getTargetUserId() != null) {
            User target = userRepository.findById(req.getTargetUserId()).orElseThrow();
            String dmName = "dm_" + Math.min(me.getId(), target.getId()) + "_" + Math.max(me.getId(), target.getId());
            return roomRepository.findByName(dmName)
                .map(r -> toResponse(r, me.getId()))
                .orElseGet(() -> {
                    Room dm = Room.builder()
                        .name(dmName)
                        .description("Direct message")
                        .isPrivate(true)
                        .createdBy(me)
                        .members(new ArrayList<>(List.of(me, target)))
                        .build();
                    return toResponse(roomRepository.save(dm), me.getId());
                });
        }

        Room room = Room.builder()
            .name(req.getName().toLowerCase().replaceAll("\\s+", "-"))
            .description(req.getDescription())
            .isPrivate(false)
            .createdBy(me)
            .members(new ArrayList<>(List.of(me)))
            .build();
        return toResponse(roomRepository.save(room), me.getId());
    }

    @Transactional
    public RoomResponse joinRoom(Long roomId, String email) {
        User me = userService.getByEmail(email);
        Room room = roomRepository.findById(roomId).orElseThrow();
        if (room.getMembers().stream().noneMatch(u -> u.getId().equals(me.getId()))) {
            room.getMembers().add(me);
            roomRepository.save(room);
        }
        return toResponse(room, me.getId());
    }

    public RoomResponse getById(Long roomId, String email) {
        User me = userService.getByEmail(email);
        Room room = roomRepository.findById(roomId).orElseThrow();
        return toResponse(room, me.getId());
    }

    public RoomResponse toResponse(Room room, Long userId) {
        RoomResponse r = new RoomResponse();
        r.setId(room.getId());
        r.setName(room.getName());
        r.setDescription(room.getDescription());
        r.setPrivate(room.isPrivate());
        if (room.getCreatedBy() != null)
            r.setCreatedBy(userService.toResponse(room.getCreatedBy()));
        if (room.getMembers() != null)
            r.setMembers(room.getMembers().stream().map(userService::toResponse).collect(Collectors.toList()));
        long roomUnread = notificationRepository.findByUserIdAndRoomIdAndReadFalse(userId, room.getId()).size();
        r.setUnreadCount((int) roomUnread);
        List<Message> last = messageRepository.findByRoomIdOrderByCreatedAtDesc(room.getId(), PageRequest.of(0, 1));
        if (!last.isEmpty()) r.setLastMessage(toMessageResponse(last.get(0)));
        r.setCreatedAt(room.getCreatedAt());
        return r;
    }

    public MessageResponse toMessageResponse(Message m) {
        MessageResponse r = new MessageResponse();
        r.setId(m.getId());
        r.setContent(m.getContent());
        r.setSender(userService.toResponse(m.getSender()));
        r.setRoomId(m.getRoom().getId());
        r.setCreatedAt(m.getCreatedAt());
        return r;
    }
}