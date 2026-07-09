package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<String> tokenOpt = userService.login(request);
        if (tokenOpt.isPresent()) {
            return ResponseEntity.ok(new LoginResponse(tokenOpt.get()));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Collections.singletonMap("error", "Email ou senha inválidos."));
    }

    @PostMapping("/invite")
    public ResponseEntity<Map<String, String>> invite(@Valid @RequestBody InviteUserRequest request) {
        String token = userService.inviteUser(request);
        return ResponseEntity.ok(Collections.singletonMap("token", token));
    }

    @PostMapping("/accept-invite")
    public ResponseEntity<Map<String, String>> acceptInvite(@Valid @RequestBody AcceptInviteRequest request) {
        boolean success = userService.acceptInvite(request);
        if (success) {
            return ResponseEntity.ok(Collections.singletonMap("message", "Invitation accepted successfully"));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Collections.singletonMap("error", "Invalid or expired invitation token"));
    }
}
