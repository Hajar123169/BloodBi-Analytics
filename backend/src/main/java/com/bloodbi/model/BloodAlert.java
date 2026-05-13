package com.bloodbi.model;

import com.bloodbi.model.Enums.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blood_alerts")
public class BloodAlert {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public String title;
    @Column(length = 1000)
    public String message;
    @Enumerated(EnumType.STRING)
    public AlertSeverity severity;
    @Enumerated(EnumType.STRING)
    public BloodType bloodType;
    public String city;
    public String centerName;
    public Boolean resolved = false;
    public LocalDateTime createdAt = LocalDateTime.now();
}
