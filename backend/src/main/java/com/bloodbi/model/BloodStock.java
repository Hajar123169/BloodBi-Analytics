package com.bloodbi.model;

import com.bloodbi.model.Enums.*;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "blood_stocks")
public class BloodStock {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @ManyToOne
    public BloodBankCenter center;
    @Enumerated(EnumType.STRING)
    public BloodType bloodType;
    @Enumerated(EnumType.STRING)
    public ComponentType componentType;
    public Integer quantity;
    public Integer minThreshold;
    @Enumerated(EnumType.STRING)
    public StockStatus status;
    public LocalDate expiryDate;
    public LocalDateTime lastUpdated = LocalDateTime.now();
}
