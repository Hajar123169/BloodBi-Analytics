package com.bloodbi.repository;

import com.bloodbi.model.Donation;
import com.bloodbi.model.Enums.DonationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationRepository extends JpaRepository<Donation, Long> {
    long countByStatus(DonationStatus status);
}
