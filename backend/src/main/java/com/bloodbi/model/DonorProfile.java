package com.bloodbi.model;

import com.bloodbi.model.Enums.BloodType;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "donor_profiles")
public class DonorProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public String fullName;
    @Enumerated(EnumType.STRING)
    public BloodType bloodType;
    public String city;
    public String address;
    public String phone;
    public String email;
    public Double latitude;
    public Double longitude;
    public Boolean available = true;
    public LocalDate lastDonationDate;
    public Integer totalDonations = 0;
    public LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    public BloodBankCenter preferredCenter;
}
