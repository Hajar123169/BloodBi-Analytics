package com.bloodbi.controller;

import com.bloodbi.dto.LoginRequest;
import com.bloodbi.dto.RegisterRequest;
import com.bloodbi.model.AppUser;
import com.bloodbi.model.DonorProfile;
import com.bloodbi.model.Enums.BloodType;
import com.bloodbi.model.Enums.UserRole;
import com.bloodbi.repository.AppUserRepository;
import com.bloodbi.repository.DonorProfileRepository;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository users;
    private final DonorProfileRepository donors;

    public AuthController(
            AppUserRepository users,
            DonorProfileRepository donors
    ) {
        this.users = users;
        this.donors = donors;
    }

    @GetMapping("/test")
    public Map<String, String> test() {
        return Map.of(
                "message",
                "BloodBI backend is working"
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        return users.findByUsername(request.username)
                .filter(user ->
                        user.password.equals(request.password)
                        && Boolean.TRUE.equals(user.active)
                )
                .<ResponseEntity<?>>map(user ->
                        ResponseEntity.ok(
                                Map.of(
                                        "success", true,
                                        "id", user.id,
                                        "username", user.username,
                                        "email", user.email,
                                        "role", user.role.name(),
                                        "token", "demo-token-" + user.id
                                )
                        )
                )
                .orElseGet(() ->
                        ResponseEntity.status(401).body(
                                Map.of(
                                        "success", false,
                                        "message", "Invalid credentials"
                                )
                        )
                );
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody AppUser user
    ) {

        try {

            if (user.role == null) {
                user.role = UserRole.CENTER_MANAGER;
            }

            user.active = true;

            AppUser savedUser =
                    users.save(user);

            return ResponseEntity.ok(savedUser);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", "Erreur register web : " + e.getMessage()
                            )
                    );
        }
    }

    @PostMapping("/register-donor")
    public ResponseEntity<?> registerDonor(
            @RequestBody RegisterRequest request
    ) {

        try {

            if (
                    request.fullName == null ||
                    request.email == null ||
                    request.password == null ||
                    request.phone == null ||
                    request.bloodGroup == null
            ) {
                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "success", false,
                                        "message", "Tous les champs sont obligatoires"
                                )
                        );
            }

            AppUser user = new AppUser();

            user.username = request.fullName;
            user.email = request.email;
            user.password = request.password;
            user.role = UserRole.DONOR;
            user.active = true;

            AppUser savedUser =
                    users.save(user);

            DonorProfile donor =
                    new DonorProfile();

            donor.fullName = request.fullName;
            donor.email = request.email;
            donor.phone = request.phone;
            donor.city = "Casablanca";
            donor.address = "Adresse utilisateur";
            donor.available = true;
            donor.totalDonations = 0;

            try {
                donor.bloodType =
                        BloodType.valueOf(
                                request.bloodGroup
                        );
            } catch (Exception e) {
                donor.bloodType =
                        BloodType.O_POS;
            }

            donors.save(donor);

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "id", savedUser.id,
                            "username", savedUser.username,
                            "email", savedUser.email,
                            "role", savedUser.role.name(),
                            "token", "demo-token-" + savedUser.id
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", "Erreur register mobile : " + e.getMessage()
                            )
                    );
        }
    }
}