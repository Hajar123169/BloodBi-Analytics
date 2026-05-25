package com.bloodbi.model;

import com.bloodbi.model.Enums.AppointmentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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