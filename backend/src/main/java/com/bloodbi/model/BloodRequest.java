package com.bloodbi.model;

import com.bloodbi.model.Enums.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blood_requests")
public class BloodRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public String patientName;
    @Enumerated(EnumType.STRING)
    public BloodType bloodType;
    @Enumerated(EnumType.STRING)
    public UrgencyLevel urgency;
    @Enumerated(EnumType.STRING)
    public RequestStatus status = RequestStatus.PENDING;
    public String hospital;
    public String city;
    public Double latitude;
    public Double longitude;
    public String notes;
    public LocalDateTime createdAt = LocalDateTime.now();
    public LocalDateTime fulfilledAt;

    @ManyToOne
    public BloodBankCenter center;
}
