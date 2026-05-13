package com.bloodbi.model;

import com.bloodbi.model.Enums.UserRole;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_users")
public class AppUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @Column(unique = true, nullable = false)
    public String username;
    @Column(unique = true, nullable = false)
    public String email;
    @Column(nullable = false)
    public String password;
    @Enumerated(EnumType.STRING)
    public UserRole role = UserRole.DONOR;
    public Boolean active = true;
    public LocalDateTime createdAt = LocalDateTime.now();
}
