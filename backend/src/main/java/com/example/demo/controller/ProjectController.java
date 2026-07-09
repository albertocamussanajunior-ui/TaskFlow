package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.model.Project;
import com.example.demo.model.Task;
import com.example.demo.service.ProjectService;
import com.example.demo.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private TaskService taskService;

    @GetMapping
    public ResponseEntity<List<Project>> listProjects() {
        return ResponseEntity.ok(projectService.listProjects());
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@Valid @RequestBody CreateProjectRequest request, Authentication authentication) {
        String email = authentication.getName();
        Project created = projectService.createProject(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProject(@PathVariable String id) {
        return projectService.getProject(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable String id, @Valid @RequestBody CreateProjectRequest request, Authentication authentication) {
        String email = authentication.getName();
        return projectService.updateProject(id, request, email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Project> updateProjectStatus(@PathVariable String id, @Valid @RequestBody UpdateProjectStatusRequest request, Authentication authentication) {
        String email = authentication.getName();
        return projectService.updateProjectStatus(id, request, email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProject(@PathVariable String id) {
        boolean success = projectService.deleteProject(id);
        if (success) {
            return ResponseEntity.ok(Collections.singletonMap("message", "Project deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/tasks")
    public ResponseEntity<Task> createTask(@PathVariable("id") String projectId, @Valid @RequestBody CreateTaskRequest request, Authentication authentication) {
        String email = authentication.getName();
        return taskService.createTask(projectId, request, email)
                .map(task -> ResponseEntity.status(HttpStatus.CREATED).body(task))
                .orElse(ResponseEntity.notFound().build());
    }
}
