package com.bloodbi.repository;

import com.bloodbi.model.BloodStock;
import com.bloodbi.model.Enums.StockStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BloodStockRepository extends JpaRepository<BloodStock, Long> {
    long countByStatus(StockStatus status);
    List<BloodStock> findByStatus(StockStatus status);
    
    // Méthodes pour les filtres
    List<BloodStock> findByCenterCity(String city);
    List<BloodStock> findByBloodType(com.bloodbi.model.Enums.BloodType bloodType);
    
    // Recherche par centre
    @Query("SELECT s FROM BloodStock s WHERE LOWER(s.center.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.center.city) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<BloodStock> searchByCenterNameOrCity(@Param("search") String search);
}