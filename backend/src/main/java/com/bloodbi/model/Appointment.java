package com.bloodbi.model;

import com.bloodbi.model.Enums.AppointmentStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    public DonorProfile donor;

    @ManyToOne
    public BloodRequest request;

    @ManyToOne
    public BloodBankCenter center;

    @Enumerated(EnumType.STRING)
    public AppointmentStatus status = AppointmentStatus.PENDING;

    public LocalDateTime scheduledAt;
    public LocalDateTime confirmedAt;
    public LocalDateTime cancelledAt;
    public LocalDateTime completedAt;
    public String contactPhone;

    @Column(length = 1000)
    public String notes;

    public LocalDateTime createdAt = LocalDateTime.now();
}
