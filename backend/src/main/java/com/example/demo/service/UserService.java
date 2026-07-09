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
}
