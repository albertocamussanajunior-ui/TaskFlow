package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class CreateProjectRequest {
    @NotBlank(message = "Project name is required")
    private String name;

    private String description;

    @JsonProperty("due_date")
    private String dueDate;

    @JsonProperty("start_date")
    private String startDate;

    private String responsible;

    private List<String> members;
}
