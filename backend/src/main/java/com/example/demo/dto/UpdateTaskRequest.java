package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateTaskRequest {
    @NotBlank(message = "Task name is required")
    private String name;

    private String description;

    private String assignee;

    @JsonProperty("due_date")
    private String dueDate;

    private String priority;
}
