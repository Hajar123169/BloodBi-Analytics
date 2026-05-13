package com.bloodbi.controller;

import com.bloodbi.model.DonorProfile;
import com.bloodbi.model.Enums.BloodType;
import com.bloodbi.repository.DonorProfileRepository;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/donors")
public class DonorController {
    private final DonorProfileRepository donors;
    public DonorController(DonorProfileRepository donors) { this.donors = donors; }

    @GetMapping
    public List<DonorProfile> all(@RequestParam(required = false) String city) {
        return city == null ? donors.findAll() : donors.findByCityIgnoreCase(city);
    }

    @GetMapping("/compatible")
    public List<DonorProfile> compatible(@RequestParam BloodType bloodType, @RequestParam String city) {
        return donors.findByBloodTypeAndCityIgnoreCaseAndAvailableTrue(bloodType, city);
    }

    @PostMapping
    public DonorProfile create(@RequestBody DonorProfile donor) { return donors.save(donor); }

    @PutMapping("/{id}")
    public DonorProfile update(@PathVariable Long id, @RequestBody DonorProfile donor) {
        donor.id = id;
        return donors.save(donor);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { donors.deleteById(id); }
}
