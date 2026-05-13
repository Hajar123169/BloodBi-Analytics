package com.bloodbi.model;

public class Enums {
    public enum BloodType { A_POS, A_NEG, B_POS, B_NEG, AB_POS, AB_NEG, O_POS, O_NEG }
    public enum UrgencyLevel { LOW, MEDIUM, HIGH, CRITICAL }
    public enum RequestStatus { PENDING, FULFILLED, CANCELLED }
    public enum StockStatus { NORMAL, LOW, CRITICAL }
    public enum ComponentType { WHOLE_BLOOD, RED_CELLS, PLASMA, PLATELETS }
    public enum UserRole { ADMIN, DONOR, PATIENT, CENTER_MANAGER }
    public enum AlertSeverity { LOW, MEDIUM, HIGH, CRITICAL }
    public enum DonationStatus { PLANNED, FULFILLED, CANCELLED }
}
