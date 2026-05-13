package com.bloodbi.controller;

import com.bloodbi.model.Enums.*;
import com.bloodbi.repository.*;
import java.util.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DonorProfileRepository donors;
    private final BloodRequestRepository requests;
    private final BloodStockRepository stocks;
    private final BloodAlertRepository alerts;
    private final DonationRepository donations;
    private final BloodBankCenterRepository centers;

    public DashboardController(DonorProfileRepository donors, BloodRequestRepository requests, BloodStockRepository stocks,
                               BloodAlertRepository alerts, DonationRepository donations, BloodBankCenterRepository centers) {
        this.donors = donors;
        this.requests = requests;
        this.stocks = stocks;
        this.alerts = alerts;
        this.donations = donations;
        this.centers = centers;
    }

    @GetMapping("/kpis")
    public Map<String, Object> kpis() {
        long totalRequests = requests.count();
        long fulfilled = requests.countByStatus(RequestStatus.FULFILLED);
        double fulfillmentRate = totalRequests == 0 ? 0 : Math.round((fulfilled * 10000.0 / totalRequests)) / 100.0;
        return Map.of(
            "totalDonors", donors.count(),
            "availableDonors", donors.countByAvailableTrue(),
            "activeRequests", requests.countByStatus(RequestStatus.PENDING),
            "criticalRequests", requests.countByUrgency(UrgencyLevel.CRITICAL),
            "fulfilledDonations", donations.countByStatus(DonationStatus.FULFILLED),
            "criticalStocks", stocks.countByStatus(StockStatus.CRITICAL),
            "activeAlerts", alerts.countByResolvedFalse(),
            "centers", centers.count(),
            "fulfillmentRate", fulfillmentRate
        );
    }

    @GetMapping("/analytics")
    public Map<String, Object> analytics() {
        return Map.of(
            "monthlyActivity", List.of(
                Map.of("month", "Jan", "donations", 45, "requests", 38),
                Map.of("month", "Feb", "donations", 52, "requests", 44),
                Map.of("month", "Mar", "donations", 60, "requests", 51),
                Map.of("month", "Apr", "donations", 72, "requests", 66),
                Map.of("month", "May", "donations", 94, "requests", 78),
                Map.of("month", "Jun", "donations", 108, "requests", 89)
            ),
            "bloodGroupDistribution", List.of(
                Map.of("bloodType", "O+", "donors", 60),
                Map.of("bloodType", "A+", "donors", 55),
                Map.of("bloodType", "B+", "donors", 28),
                Map.of("bloodType", "AB+", "donors", 15),
                Map.of("bloodType", "O-", "donors", 18),
                Map.of("bloodType", "A-", "donors", 17),
                Map.of("bloodType", "B-", "donors", 8),
                Map.of("bloodType", "AB-", "donors", 4)
            ),
            "cityDemand", List.of(
                Map.of("city", "Casablanca", "requests", 42, "critical", 11),
                Map.of("city", "Rabat", "requests", 24, "critical", 5),
                Map.of("city", "Marrakech", "requests", 21, "critical", 7),
                Map.of("city", "El Jadida", "requests", 16, "critical", 3),
                Map.of("city", "Fes", "requests", 13, "critical", 2)
            )
        );
    }
}
