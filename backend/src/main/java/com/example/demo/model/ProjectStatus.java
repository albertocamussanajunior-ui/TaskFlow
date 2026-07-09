package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ProjectStatus {
    ACTIVE("active"),
    COMPLETED("completed"),
    PAUSED("paused");

    private final String value;

    ProjectStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
