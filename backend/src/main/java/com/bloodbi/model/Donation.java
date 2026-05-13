package com.bloodbi.model;

import com.bloodbi.model.Enums.DonationStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
public class Donation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @ManyToOne
    public DonorProfile donor;
    @ManyToOne
    public BloodRequest request;
    @ManyToOne
    public BloodBankCenter center;
    @Enumerated(EnumType.STRING)
    public DonationStatus status = DonationStatus.PLANNED;
    public Double latitude;
    public Double longitude;
    public LocalDateTime scheduledAt;
    public LocalDateTime donatedAt;
    public String notes;
}
