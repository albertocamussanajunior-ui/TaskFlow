package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.model.Task;
import com.example.demo.model.TaskPriority;
import com.example.demo.model.TaskStatus;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private NotificationService notificationService;

    public List<Task> listTasks(String projectId, String assignee, String statusStr, Integer page, Integer limit) {
        TaskStatus status = null;
        if (statusStr != null && !statusStr.trim().isEmpty()) {
            try {
                status = TaskStatus.valueOf(statusStr.toUpperCase());
            } catch (Exception e) {
                // Fallback for case-insensitive and match formats like "in_progress"
                if ("IN_PROGRESS".equalsIgnoreCase(statusStr) || "INPROGRESS".equalsIgnoreCase(statusStr)) {
                    status = TaskStatus.IN_PROGRESS;
                } else if ("TODO".equalsIgnoreCase(statusStr)) {
                    status = TaskStatus.TODO;
                } else if ("REVIEW".equalsIgnoreCase(statusStr)) {
                    status = TaskStatus.REVIEW;
                } else if ("DONE".equalsIgnoreCase(statusStr)) {
                    status = TaskStatus.DONE;
                }
            }
        }

        if (page != null || limit != null) {
            int size = limit != null ? limit : 20;
            int pageIndex = page != null && page > 0 ? page - 1 : 0;
            Pageable pageable = PageRequest.of(pageIndex, size);
            return taskRepository.findFilteredTasks(projectId, assignee, status, pageable).getContent();
        }

        return taskRepository.findFilteredTasks(projectId, assignee, status);
    }

    public Optional<Task> getTask(String id) {
        Optional<Task> task = taskRepository.findById(id);
        task.ifPresent(t -> {
            t.setLastAccessedAt(LocalDateTime.now());
            taskRepository.save(t);
        });
        return task;
    }

    public Optional<Task> createTask(String projectId, CreateTaskRequest request, String currentUserEmail) {
        if (!projectRepository.existsById(projectId)) {
            return Optional.empty();
        }

        TaskPriority priority = TaskPriority.MEDIUM_PRIORITY;
        if (request.getPriority() != null) {
            try {
                priority = TaskPriority.valueOf(request.getPriority().toUpperCase());
            } catch (Exception e) {
                if ("LOW_PRIORITY".equalsIgnoreCase(request.getPriority()) || "LOW".equalsIgnoreCase(request.getPriority())) {
                    priority = TaskPriority.LOW_PRIORITY;
                } else if ("HIGH_PRIORITY".equalsIgnoreCase(request.getPriority()) || "HIGH".equalsIgnoreCase(request.getPriority())) {
                    priority = TaskPriority.HIGH_PRIORITY;
                } else if ("CRITICAL_PRIORITY".equalsIgnoreCase(request.getPriority()) || "CRITICAL".equalsIgnoreCase(request.getPriority())) {
                    priority = TaskPriority.CRITICAL_PRIORITY;
                }
            }
        }

        TaskStatus status = TaskStatus.TODO;
        if (request.getStatus() != null) {
            try {
                status = TaskStatus.valueOf(request.getStatus().toUpperCase());
            } catch (Exception e) {
                if ("IN_PROGRESS".equalsIgnoreCase(request.getStatus())) {
                    status = TaskStatus.IN_PROGRESS;
                } else if ("REVIEW".equalsIgnoreCase(request.getStatus())) {
                    status = TaskStatus.REVIEW;
                } else if ("DONE".equalsIgnoreCase(request.getStatus())) {
                    status = TaskStatus.DONE;
                }
            }
        }

        Task task = Task.builder()
                .projectId(projectId)
                .name(request.getName())
                .description(request.getDescription())
                .assignee(request.getAssignee())
                .dependsOn(request.getDependsOn())
                .priority(priority)
                .status(status)
                .dueDate(request.getDueDate())
                .createdBy(currentUserEmail)
                .updatedBy(currentUserEmail)
                .build();

        Task saved = taskRepository.save(task);

        if (saved.getAssignee() != null && !saved.getAssignee().isBlank()) {
            notificationService.createNotification(
                    saved.getAssignee(),
                    "task_assigned",
                    "Nova tarefa atribuída",
                    "Você foi designado para a tarefa '" + saved.getName() + "'.",
                    saved.getId(),
                    "task"
            );
        }

        return Optional.of(saved);
    }

    public Optional<Task> updateTask(String id, UpdateTaskRequest request, String currentUserEmail) {
        return taskRepository.findById(id).map(task -> {
            String previousAssignee = task.getAssignee();

            task.setName(request.getName());
            task.setDescription(request.getDescription());
            task.setAssignee(request.getAssignee());
            task.setDueDate(request.getDueDate());
            
            if (request.getPriority() != null) {
                try {
                    task.setPriority(TaskPriority.valueOf(request.getPriority().toUpperCase()));
                } catch (Exception e) {
                    if ("LOW_PRIORITY".equalsIgnoreCase(request.getPriority()) || "LOW".equalsIgnoreCase(request.getPriority())) {
                        task.setPriority(TaskPriority.LOW_PRIORITY);
                    } else if ("HIGH_PRIORITY".equalsIgnoreCase(request.getPriority()) || "HIGH".equalsIgnoreCase(request.getPriority())) {
                        task.setPriority(TaskPriority.HIGH_PRIORITY);
                    } else if ("CRITICAL_PRIORITY".equalsIgnoreCase(request.getPriority()) || "CRITICAL".equalsIgnoreCase(request.getPriority())) {
                        task.setPriority(TaskPriority.CRITICAL_PRIORITY);
                    }
                }
            }
            task.setUpdatedBy(currentUserEmail);
            Task saved = taskRepository.save(task);

            boolean assigneeChanged = saved.getAssignee() != null && !saved.getAssignee().isBlank()
                    && !saved.getAssignee().equalsIgnoreCase(previousAssignee);
            if (assigneeChanged) {
                notificationService.createNotification(
                        saved.getAssignee(),
                        "task_assigned",
                        "Nova tarefa atribuída",
                        "Você foi designado para a tarefa '" + saved.getName() + "'.",
                        saved.getId(),
                        "task"
                );
            }

            return saved;
        });
    }

    public Optional<Task> updateTaskStatus(String id, UpdateTaskStatusRequest request, String currentUserEmail) {
        return taskRepository.findById(id).map(task -> {
            if (request.getStatus() != null) {
                try {
                    task.setStatus(TaskStatus.valueOf(request.getStatus().toUpperCase()));
                } catch (Exception e) {
                    if ("IN_PROGRESS".equalsIgnoreCase(request.getStatus())) {
                        task.setStatus(TaskStatus.IN_PROGRESS);
                    } else if ("REVIEW".equalsIgnoreCase(request.getStatus())) {
                        task.setStatus(TaskStatus.REVIEW);
                    } else if ("DONE".equalsIgnoreCase(request.getStatus())) {
                        task.setStatus(TaskStatus.DONE);
                    }
                }
            }
            task.setUpdatedBy(currentUserEmail);
            return taskRepository.save(task);
        });
    }

    public boolean deleteTask(String id) {
        return taskRepository.findById(id).map(task -> {
            taskRepository.delete(task);
            return true;
        }).orElse(false);
    }
}
