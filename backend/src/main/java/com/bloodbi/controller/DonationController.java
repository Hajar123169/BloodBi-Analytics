package com.bloodbi.controller;

import com.bloodbi.model.Donation;
import com.bloodbi.repository.DonationRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/donations")
public class DonationController {
    private final DonationRepository donations;
    public DonationController(DonationRepository donations) { this.donations = donations; }

    @GetMapping
    public List<Donation> all() { return donations.findAll(); }

    @PostMapping
    public Donation create(@RequestBody Donation donation) {
        if (donation.scheduledAt == null) donation.scheduledAt = LocalDateTime.now().plusDays(1);
        return donations.save(donation);
    }
}
