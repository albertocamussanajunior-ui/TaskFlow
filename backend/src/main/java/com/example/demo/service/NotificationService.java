package com.example.demo.service;

import com.example.demo.model.Notification;
import com.example.demo.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> listNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public boolean markAsRead(String id, String userId) {
        return notificationRepository.findById(id).map(notif -> {
            if (notif.getUserId().equalsIgnoreCase(userId)) {
                notif.setRead(true);
                notificationRepository.save(notif);
                return true;
            }
            return false;
        }).orElse(false);
    }

    @Transactional
    public void markAllAsRead(String userId) {
        notificationRepository.markAllAsRead(userId);
    }

    public boolean deleteNotification(String id) {
        return notificationRepository.findById(id).map(notif -> {
            notificationRepository.delete(notif);
            return true;
        }).orElse(false);
    }

    public Notification createNotification(String userId, String type, String title, String message, String entityId, String entityType) {
        Notification notif = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .entityId(entityId)
                .entityType(entityType)
                .read(false)
                .build();
        return notificationRepository.save(notif);
    }
}
