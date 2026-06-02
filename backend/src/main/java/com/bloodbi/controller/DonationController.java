package com.bloodbi.controller;

import com.bloodbi.model.BloodBankCenter;
import com.bloodbi.model.BloodRequest;
import com.bloodbi.model.Donation;
import com.bloodbi.model.DonorProfile;
import com.bloodbi.model.Enums.DonationStatus;
import com.bloodbi.repository.BloodBankCenterRepository;
import com.bloodbi.repository.BloodRequestRepository;
import com.bloodbi.repository.DonationRepository;
import com.bloodbi.repository.DonorProfileRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationRepository donations;
    private final DonorProfileRepository donors;
    private final BloodBankCenterRepository centers;
    private final BloodRequestRepository requests;

    public DonationController(
            DonationRepository donations,
            DonorProfileRepository donors,
            BloodBankCenterRepository centers,
            BloodRequestRepository requests
    ) {
        this.donations = donations;
        this.donors = donors;
        this.centers = centers;
        this.requests = requests;
    }

    @GetMapping
    public List<Donation> all() {
        return donations.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody Donation donation
    ) {

        try {

            if (
                    donation.donor == null ||
                    donation.donor.id == null
            ) {
                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "success", false,
                                        "message", "Donneur obligatoire"
                                )
                        );
            }

            if (
                    donation.center == null ||
                    donation.center.id == null
            ) {
                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "success", false,
                                        "message", "Centre obligatoire"
                                )
                        );
            }

            DonorProfile donor =
                    donors.findById(
                            donation.donor.id
                    ).orElseThrow();

            BloodBankCenter center =
                    centers.findById(
                            donation.center.id
                    ).orElseThrow();

            donation.donor = donor;
            donation.center = center;

            if (
                    donation.request != null &&
                    donation.request.id != null
            ) {
                BloodRequest request =
                        requests.findById(
                                donation.request.id
                        ).orElse(null);

                donation.request = request;
            } else {
                donation.request = null;
            }

            if (donation.status == null) {
                donation.status =
                        DonationStatus.PLANNED;
            }

            if (donation.scheduledAt == null) {
                donation.scheduledAt =
                        LocalDateTime.now().plusDays(1);
            }

            if (donation.latitude == null) {
                donation.latitude =
                        center.latitude;
            }

            if (donation.longitude == null) {
                donation.longitude =
                        center.longitude;
            }

            Donation saved =
                    donations.save(donation);

            if (donor.totalDonations == null) {
                donor.totalDonations = 0;
            }

            donor.totalDonations =
                    donor.totalDonations + 1;

            if (saved.scheduledAt != null) {
                donor.lastDonationDate =
                        saved.scheduledAt.toLocalDate();
            }

            donor.available = true;

            donors.save(donor);

            return ResponseEntity.ok(saved);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", "Erreur donation : " + e.getMessage()
                            )
                    );
        }
    }
}