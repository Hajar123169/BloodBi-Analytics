package com.bloodbi.controller;

import com.bloodbi.dto.DonorMatchResult;
import com.bloodbi.dto.MatchingResponse;
import com.bloodbi.model.BloodBankCenter;
import com.bloodbi.model.BloodRequest;
import com.bloodbi.model.Donation;
import com.bloodbi.model.DonorProfile;
import com.bloodbi.model.Enums.BloodType;
import com.bloodbi.model.Enums.DonationStatus;
import com.bloodbi.repository.BloodBankCenterRepository;
import com.bloodbi.repository.BloodRequestRepository;
import com.bloodbi.repository.DonationRepository;
import com.bloodbi.repository.DonorProfileRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matching")
public class MatchingController {
    private static final int MIN_DAYS_BETWEEN_DONATIONS = 56;

    private final DonorProfileRepository donors;
    private final BloodRequestRepository requests;
    private final DonationRepository donations;
    private final BloodBankCenterRepository centers;

    public MatchingController(DonorProfileRepository donors,
                              BloodRequestRepository requests,
                              DonationRepository donations,
                              BloodBankCenterRepository centers) {
        this.donors = donors;
        this.requests = requests;
        this.donations = donations;
        this.centers = centers;
    }

    @GetMapping("/requests/{requestId}")
    public MatchingResponse matchForRequest(@PathVariable Long requestId,
                                            @RequestParam(defaultValue = "10") int limit) {
        BloodRequest request = requests.findById(requestId).orElseThrow();
        return buildResponse(request, request.bloodType, request.city, request.latitude, request.longitude, request.center, limit);
    }

    @GetMapping("/search")
    public MatchingResponse matchByCriteria(@RequestParam BloodType bloodType,
                                            @RequestParam(required = false) String city,
                                            @RequestParam(required = false) Double latitude,
                                            @RequestParam(required = false) Double longitude,
                                            @RequestParam(required = false) Long centerId,
                                            @RequestParam(defaultValue = "10") int limit) {
        BloodBankCenter center = centerId == null ? null : centers.findById(centerId).orElse(null);
        return buildResponse(null, bloodType, city, latitude, longitude, center, limit);
    }

    @PostMapping("/requests/{requestId}/schedule")
    public Donation scheduleDonationFromMatch(@PathVariable Long requestId,
                                              @RequestParam Long donorId,
                                              @RequestParam(required = false) String scheduledAt) {
        BloodRequest request = requests.findById(requestId).orElseThrow();
        DonorProfile donor = donors.findById(donorId).orElseThrow();

        Donation donation = new Donation();
        donation.request = request;
        donation.donor = donor;
        donation.center = request.center != null ? request.center : donor.preferredCenter;
        donation.status = DonationStatus.PLANNED;
        donation.latitude = request.latitude != null ? request.latitude : donor.latitude;
        donation.longitude = request.longitude != null ? request.longitude : donor.longitude;
        donation.scheduledAt = scheduledAt == null || scheduledAt.isBlank()
                ? LocalDateTime.now().plusDays(1)
                : LocalDateTime.parse(scheduledAt);
        donation.notes = "Donation planifiee automatiquement depuis le matching intelligent";

        return donations.save(donation);
    }

    private MatchingResponse buildResponse(BloodRequest request,
                                           BloodType bloodType,
                                           String city,
                                           Double latitude,
                                           Double longitude,
                                           BloodBankCenter center,
                                           int limit) {
        List<BloodType> compatibleTypes = compatibleDonorTypesFor(bloodType);
        List<DonorMatchResult> results = donors.findByBloodTypeInAndAvailableTrue(compatibleTypes)
                .stream()
                .map(donor -> scoreDonor(donor, bloodType, city, latitude, longitude, center))
                .filter(DonorMatchResult::eligibleByDonationDelay)
                .sorted(Comparator.comparingInt(DonorMatchResult::score).reversed())
                .limit(Math.max(1, Math.min(limit, 50)))
                .toList();

        return new MatchingResponse(request, bloodType, city, compatibleTypes, results);
    }

    private DonorMatchResult scoreDonor(DonorProfile donor,
                                        BloodType patientBloodType,
                                        String requestCity,
                                        Double requestLatitude,
                                        Double requestLongitude,
                                        BloodBankCenter requestCenter) {
        int score = 40;
        List<String> reasons = new ArrayList<>();

        boolean exactBloodType = donor.bloodType == patientBloodType;
        if (exactBloodType) {
            score += 25;
            reasons.add("Groupe sanguin exactement identique au besoin du patient");
        } else {
            score += 15;
            reasons.add("Groupe sanguin compatible avec le besoin du patient");
        }

        boolean sameCity = requestCity != null
                && donor.city != null
                && donor.city.equalsIgnoreCase(requestCity.trim());
        if (sameCity) {
            score += 20;
            reasons.add("Même ville que la demande");
        }

        Double distanceKm = distanceKm(requestLatitude, requestLongitude, donor.latitude, donor.longitude);
        if (distanceKm != null) {
            if (distanceKm <= 5) {
                score += 15;
                reasons.add("Très proche de la demande");
            } else if (distanceKm <= 20) {
                score += 10;
                reasons.add("Distance acceptable");
            } else if (distanceKm <= 50) {
                score += 5;
                reasons.add("Peut être contacté si besoin");
            }
        }

        boolean samePreferredCenter = requestCenter != null
                && donor.preferredCenter != null
                && donor.preferredCenter.id != null
                && donor.preferredCenter.id.equals(requestCenter.id);
        if (samePreferredCenter) {
            score += 10;
            reasons.add("Centre préféré identique au centre de la demande");
        }

        boolean eligibleByDonationDelay = isEligibleByDonationDelay(donor);
        if (eligibleByDonationDelay) {
            score += 10;
            reasons.add("Délai suffisant depuis le dernier don");
        } else {
            reasons.add("Don récent: à vérifier avant de contacter le donneur");
        }

        if (donor.totalDonations != null && donor.totalDonations >= 5) {
            score += 5;
            reasons.add("Donneur expérimenté");
        }

        int finalScore = Math.min(score, 100);
        String recommendation;
        if (finalScore >= 90) recommendation = "EXCELLENT";
        else if (finalScore >= 75) recommendation = "GOOD";
        else recommendation = "POSSIBLE";

        return new DonorMatchResult(donor, finalScore, distanceKm, sameCity, exactBloodType, eligibleByDonationDelay, reasons, recommendation);
    }

    private boolean isEligibleByDonationDelay(DonorProfile donor) {
        if (donor.lastDonationDate == null) return true;
        long days = ChronoUnit.DAYS.between(donor.lastDonationDate, LocalDate.now());
        return days >= MIN_DAYS_BETWEEN_DONATIONS;
    }

    private Double distanceKm(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
        double earthRadiusKm = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round((earthRadiusKm * c) * 10.0) / 10.0;
    }

    private List<BloodType> compatibleDonorTypesFor(BloodType patientBloodType) {
        return switch (patientBloodType) {
            case A_POS -> List.of(BloodType.A_POS, BloodType.A_NEG, BloodType.O_POS, BloodType.O_NEG);
            case A_NEG -> List.of(BloodType.A_NEG, BloodType.O_NEG);
            case B_POS -> List.of(BloodType.B_POS, BloodType.B_NEG, BloodType.O_POS, BloodType.O_NEG);
            case B_NEG -> List.of(BloodType.B_NEG, BloodType.O_NEG);
            case AB_POS -> List.of(BloodType.A_POS, BloodType.A_NEG, BloodType.B_POS, BloodType.B_NEG, BloodType.AB_POS, BloodType.AB_NEG, BloodType.O_POS, BloodType.O_NEG);
            case AB_NEG -> List.of(BloodType.A_NEG, BloodType.B_NEG, BloodType.AB_NEG, BloodType.O_NEG);
            case O_POS -> List.of(BloodType.O_POS, BloodType.O_NEG);
            case O_NEG -> List.of(BloodType.O_NEG);
        };
    }
}

