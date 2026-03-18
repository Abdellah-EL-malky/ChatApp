package com.abdellah.chatapp.repository;
import com.abdellah.chatapp.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdAndReadFalse(Long userId);
    long countByUserIdAndReadFalse(Long userId);
    List<Notification> findByUserIdAndRoomIdAndReadFalse(Long userId, Long roomId);
}
