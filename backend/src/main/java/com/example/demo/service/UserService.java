package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.model.User;
import com.example.demo.model.UserStatus;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public Optional<String> login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Allow logging in if password matches and user is active
            if (user.getStatus() == UserStatus.ACTIVE && passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                String token = jwtTokenProvider.generateToken(user.getEmail(), user.getFullName(), user.getRole());
                return Optional.of(token);
            }
        }
        return Optional.empty();
    }

    public String inviteUser(InviteUserRequest request) {
        String token = UUID.randomUUID().toString();
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(new User());
        
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setRole(request.getRole() != null ? request.getRole() : "member");
        user.setStatus(UserStatus.INVITED);
        user.setInviteToken(token);
        
        if (user.getPassword() == null) {
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        }
        
        userRepository.save(user);
        return token;
    }

    public boolean acceptInvite(AcceptInviteRequest request) {
        Optional<User> userOpt = userRepository.findByInviteToken(request.getToken());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setStatus(UserStatus.ACTIVE);
            user.setInviteToken(null);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public List<User> listUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUser(String id) {
        return userRepository.findById(id);
    }

    public User createUser(CreateUserRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            throw new IllegalArgumentException("Email already exists");
        });

        User user = User.builder()
                .email(request.getEmail())
                .fullName(request.getFullName())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : "member")
                .status(parseStatus(request.getStatus(), UserStatus.ACTIVE))
                .build();

        return userRepository.save(user);
    }

    public Optional<User> updateUser(String id, UpdateUserRequest request) {
        return userRepository.findById(id).map(user -> {
            if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
                userRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
                    throw new IllegalArgumentException("Email already exists");
                });
                user.setEmail(request.getEmail());
            }

            if (request.getFullName() != null) {
                user.setFullName(request.getFullName());
            }

            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }

            if (request.getRole() != null) {
                user.setRole(request.getRole());
            }

            if (request.getStatus() != null) {
                user.setStatus(parseStatus(request.getStatus(), user.getStatus()));
            }

            return userRepository.save(user);
        });
    }

    public boolean deleteUser(String id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return true;
        }).orElse(false);
    }

    private UserStatus parseStatus(String status, UserStatus fallback) {
        if (status == null || status.isBlank()) {
            return fallback;
        }

        for (UserStatus value : UserStatus.values()) {
            if (value.getValue().equalsIgnoreCase(status) || value.name().equalsIgnoreCase(status)) {
                return value;
            }
        }

        return fallback;
    }
}
