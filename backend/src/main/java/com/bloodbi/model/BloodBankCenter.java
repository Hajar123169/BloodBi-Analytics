package com.bloodbi.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blood_bank_centers")
public class BloodBankCenter {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @Column(nullable = false)
    public String name;
    public String city;
    public String address;
    public String phone;
    public Double latitude;
    public Double longitude;
    public String region;
    public Boolean active = true;
    public LocalDateTime createdAt = LocalDateTime.now();
}
