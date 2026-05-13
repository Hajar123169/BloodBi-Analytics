package com.bloodbi.controller;

import com.bloodbi.dto.LoginRequest;
import com.bloodbi.model.AppUser;
import com.bloodbi.repository.AppUserRepository;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AppUserRepository users;

    public AuthController(AppUserRepository users) {
        this.users = users;
    }

    @GetMapping("/test")
    public Map<String, String> test() {
        return Map.of("message", "BloodBI backend is working");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return users.findByUsername(request.username)
            .filter(user -> user.password.equals(request.password) && Boolean.TRUE.equals(user.active))
            .<ResponseEntity<?>>map(user -> ResponseEntity.ok(Map.of(
                "success", true,
                "username", user.username,
                "role", user.role.name(),
                "token", "demo-token-" + user.id
            )))
            .orElseGet(() -> ResponseEntity.status(401).body(Map.of("success", false, "message", "Invalid credentials")));
    }

    @PostMapping("/register")
    public AppUser register(@RequestBody AppUser user) {
        return users.save(user);
    }
}
