package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @Email(message = "Invalid email format")
    private String email;

    @JsonProperty("full_name")
    private String fullName;

    @Size(min = 6, message = "Password must have at least 6 characters")
    private String password;

    private String role;

    private String status;
}
