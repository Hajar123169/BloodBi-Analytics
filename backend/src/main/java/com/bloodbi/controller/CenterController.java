package com.bloodbi.controller;

import com.bloodbi.model.BloodBankCenter;
import com.bloodbi.repository.BloodBankCenterRepository;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/centers")
public class CenterController {
    private final BloodBankCenterRepository centers;
    public CenterController(BloodBankCenterRepository centers) { this.centers = centers; }

    @GetMapping
    public List<BloodBankCenter> all(@RequestParam(required = false) String city) {
        return city == null ? centers.findAll() : centers.findByCityIgnoreCase(city);
    }

    @PostMapping
    public BloodBankCenter create(@RequestBody BloodBankCenter center) { return centers.save(center); }
}
