package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.model.Task;
import com.example.demo.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    public ResponseEntity<List<Task>> listTasks(
            @RequestParam(value = "project_id", required = false) String projectId,
            @RequestParam(value = "assignee", required = false) String assignee,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "limit", required = false) Integer limit) {
        List<Task> tasks = taskService.listTasks(projectId, assignee, status, page, limit);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTask(@PathVariable String id) {
        return taskService.getTask(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable String id, @Valid @RequestBody UpdateTaskRequest request, Authentication authentication) {
        String email = authentication.getName();
        return taskService.updateTask(id, request, email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable String id, @Valid @RequestBody UpdateTaskStatusRequest request, Authentication authentication) {
        String email = authentication.getName();
        return taskService.updateTaskStatus(id, request, email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTask(@PathVariable String id) {
        boolean success = taskService.deleteTask(id);
        if (success) {
            return ResponseEntity.ok(Collections.singletonMap("message", "Task deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
