package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum UserStatus {
    INVITED("invited"),
    ACTIVE("active"),
    DISABLED("disabled");

    private final String value;

    UserStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
