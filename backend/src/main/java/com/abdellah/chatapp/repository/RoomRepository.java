package com.abdellah.chatapp.repository;
import com.abdellah.chatapp.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByIsPrivateFalse();
    Optional<Room> findByName(String name);
    @Query("SELECT r FROM Room r JOIN r.members m WHERE m.id = :userId")
    List<Room> findByMemberId(Long userId);
    @Query("SELECT r FROM Room r JOIN r.members m WHERE m.id = :userId AND r.isPrivate = true")
    List<Room> findPrivateRoomsByUserId(Long userId);
}
