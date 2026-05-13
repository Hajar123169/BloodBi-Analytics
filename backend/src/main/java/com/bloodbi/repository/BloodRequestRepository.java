package com.bloodbi.repository;

import com.bloodbi.model.BloodRequest;
import com.bloodbi.model.Enums.*;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {
    long countByStatus(RequestStatus status);
    long countByUrgency(UrgencyLevel urgency);
    List<BloodRequest> findByStatus(RequestStatus status);
    List<BloodRequest> findByUrgency(UrgencyLevel urgency);
}
