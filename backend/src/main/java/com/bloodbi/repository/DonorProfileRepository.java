package com.bloodbi.repository;

import com.bloodbi.model.DonorProfile;
import com.bloodbi.model.Enums.BloodType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonorProfileRepository extends JpaRepository<DonorProfile, Long> {
    long countByAvailableTrue();
    List<DonorProfile> findByBloodTypeAndCityIgnoreCaseAndAvailableTrue(BloodType bloodType, String city);
    List<DonorProfile> findByCityIgnoreCase(String city);
}
