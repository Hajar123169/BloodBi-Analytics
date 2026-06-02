package com.bloodbi.repository;

import com.bloodbi.model.DonorProfile;
import com.bloodbi.model.Enums.BloodType;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DonorProfileRepository extends JpaRepository<DonorProfile, Long> {

    long countByAvailableTrue();

    Optional<DonorProfile> findByEmail(String email);

    List<DonorProfile> findByBloodTypeAndCityIgnoreCaseAndAvailableTrue(
            BloodType bloodType,
            String city
    );

    List<DonorProfile> findByCityIgnoreCase(String city);

    List<DonorProfile> findByBloodTypeInAndAvailableTrue(
            List<BloodType> bloodTypes
    );
}