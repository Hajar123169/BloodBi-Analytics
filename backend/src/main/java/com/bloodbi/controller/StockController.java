package com.bloodbi.controller;

import com.bloodbi.model.BloodStock;
import com.bloodbi.model.Enums.StockStatus;
import com.bloodbi.repository.BloodStockRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stocks")
public class StockController {
    private final BloodStockRepository stocks;
    public StockController(BloodStockRepository stocks) { this.stocks = stocks; }

    @GetMapping
    public List<BloodStock> all(@RequestParam(required = false) StockStatus status) {
        return status == null ? stocks.findAll() : stocks.findByStatus(status);
    }

    @GetMapping("/critical")
    public List<BloodStock> critical() { return stocks.findByStatus(StockStatus.CRITICAL); }

    @PostMapping
    public BloodStock create(@RequestBody BloodStock stock) {
        stock.lastUpdated = LocalDateTime.now();
        if (stock.status == null && stock.quantity != null && stock.minThreshold != null) {
            stock.status = stock.quantity <= stock.minThreshold ? StockStatus.CRITICAL : StockStatus.NORMAL;
        }
        return stocks.save(stock);
    }

    @PutMapping("/{id}")
    public BloodStock update(@PathVariable Long id, @RequestBody BloodStock stock) {
        stock.id = id;
        stock.lastUpdated = LocalDateTime.now();
        return stocks.save(stock);
    }

   // Dans StockController.java, ajoutez cette méthode
@DeleteMapping("/{id}")
public void delete(@PathVariable Long id) {
    stocks.deleteById(id);
}
}