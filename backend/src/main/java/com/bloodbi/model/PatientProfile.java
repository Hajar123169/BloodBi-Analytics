package com.bloodbi.model;

import com.bloodbi.model.Enums.BloodType;
import jakarta.persistence.*;

@Entity
@Table(name = "patient_profiles")
public class PatientProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public String fullName;
    public String phone;
    public String email;
    public String city;
    public String hospital;
    @Enumerated(EnumType.STRING)
    public BloodType bloodType;
}
