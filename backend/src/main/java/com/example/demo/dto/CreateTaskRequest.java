package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateTaskRequest {
    @NotBlank(message = "Task name is required")
    private String name;

    private String assignee;

    private String description;

    @JsonProperty("due_date")
    private String dueDate;

    private String priority;

    private String status;

    @JsonProperty("depends_on")
    private String dependsOn;
}
