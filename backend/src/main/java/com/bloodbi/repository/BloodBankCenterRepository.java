package com.bloodbi.repository;

import com.bloodbi.model.BloodBankCenter;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BloodBankCenterRepository extends JpaRepository<BloodBankCenter, Long> {
    List<BloodBankCenter> findByCityIgnoreCase(String city);
}
