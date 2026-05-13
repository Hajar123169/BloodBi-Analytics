package com.bloodbi.repository;

import com.bloodbi.model.BloodStock;
import com.bloodbi.model.Enums.StockStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BloodStockRepository extends JpaRepository<BloodStock, Long> {
    long countByStatus(StockStatus status);
    List<BloodStock> findByStatus(StockStatus status);
}
