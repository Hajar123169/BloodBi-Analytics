package com.bloodbi.controller;

import com.bloodbi.model.BloodAlert;
import com.bloodbi.repository.BloodAlertRepository;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {
    private final BloodAlertRepository alerts;
    public AlertController(BloodAlertRepository alerts) { this.alerts = alerts; }

    @GetMapping
    public List<BloodAlert> all(@RequestParam(required = false) Boolean activeOnly) {
        return Boolean.TRUE.equals(activeOnly) ? alerts.findByResolvedFalseOrderByCreatedAtDesc() : alerts.findAll();
    }

    @PostMapping
    public BloodAlert create(@RequestBody BloodAlert alert) { return alerts.save(alert); }

    @PatchMapping("/{id}/resolve")
    public BloodAlert resolve(@PathVariable Long id) {
        BloodAlert a = alerts.findById(id).orElseThrow();
        a.resolved = true;
        return alerts.save(a);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { alerts.deleteById(id); }
}
