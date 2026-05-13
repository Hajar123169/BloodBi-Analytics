package com.bloodbi.repository;

import com.bloodbi.model.BloodAlert;
import com.bloodbi.model.Enums.AlertSeverity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BloodAlertRepository extends JpaRepository<BloodAlert, Long> {
    long countByResolvedFalse();
    long countBySeverityAndResolvedFalse(AlertSeverity severity);
    List<BloodAlert> findByResolvedFalseOrderByCreatedAtDesc();
}
