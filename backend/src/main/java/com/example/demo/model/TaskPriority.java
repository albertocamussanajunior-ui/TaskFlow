package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum TaskPriority {
    LOW_PRIORITY("low_priority"),
    MEDIUM_PRIORITY("medium_priority"),
    HIGH_PRIORITY("high_priority"),
    CRITICAL_PRIORITY("critical_priority");

    private final String value;

    TaskPriority(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
