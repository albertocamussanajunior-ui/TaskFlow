package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.model.Project;
import com.example.demo.model.ProjectStatus;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    public List<Project> listProjects() {
        return projectRepository.findAll();
    }

    public Optional<Project> getProject(String id) {
        Optional<Project> proj = projectRepository.findById(id);
        proj.ifPresent(p -> {
            p.setLastAccessedAt(LocalDateTime.now());
            projectRepository.save(p);
        });
        return proj;
    }

    public Project createProject(CreateProjectRequest request, String currentUserEmail) {
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .startDate(request.getStartDate() != null ? request.getStartDate() : java.time.LocalDate.now().toString())
                .responsible(request.getResponsible() != null ? request.getResponsible() : currentUserEmail)
                .members(request.getMembers())
                .status(ProjectStatus.ACTIVE)
                .createdBy(currentUserEmail)
                .updatedBy(currentUserEmail)
                .build();
        return projectRepository.save(project);
    }

    public Optional<Project> updateProject(String id, CreateProjectRequest request, String currentUserEmail) {
        return projectRepository.findById(id).map(project -> {
            project.setName(request.getName());
            project.setDescription(request.getDescription());
            project.setDueDate(request.getDueDate());
            if (request.getStartDate() != null) {
                project.setStartDate(request.getStartDate());
            }
            project.setResponsible(request.getResponsible());
            project.setMembers(request.getMembers());
            project.setUpdatedBy(currentUserEmail);
            return projectRepository.save(project);
        });
    }

    public Optional<Project> updateProjectStatus(String id, UpdateProjectStatusRequest request, String currentUserEmail) {
        return projectRepository.findById(id).map(project -> {
            try {
                ProjectStatus status = ProjectStatus.valueOf(request.getStatus().toUpperCase());
                project.setStatus(status);
            } catch (Exception e) {
                if ("PAUSED".equalsIgnoreCase(request.getStatus()) || "ON_HOLD".equalsIgnoreCase(request.getStatus())) {
                    project.setStatus(ProjectStatus.PAUSED);
                } else if ("COMPLETED".equalsIgnoreCase(request.getStatus())) {
                    project.setStatus(ProjectStatus.COMPLETED);
                } else {
                    project.setStatus(ProjectStatus.ACTIVE);
                }
            }
            project.setUpdatedBy(currentUserEmail);
            return projectRepository.save(project);
        });
    }

    public boolean deleteProject(String id) {
        return projectRepository.findById(id).map(project -> {
            List<com.example.demo.model.Task> tasks = taskRepository.findFilteredTasks(project.getId(), null, null);
            taskRepository.deleteAll(tasks);
            projectRepository.delete(project);
            return true;
        }).orElse(false);
    }
}
