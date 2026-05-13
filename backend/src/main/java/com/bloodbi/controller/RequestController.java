package com.bloodbi.controller;

import com.bloodbi.model.BloodRequest;
import com.bloodbi.model.Enums.*;
import com.bloodbi.repository.BloodRequestRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/requests")
public class RequestController {
    private final BloodRequestRepository requests;
    public RequestController(BloodRequestRepository requests) { this.requests = requests; }

    @GetMapping
    public List<BloodRequest> all(@RequestParam(required = false) RequestStatus status) {
        return status == null ? requests.findAll() : requests.findByStatus(status);
    }

    @GetMapping("/critical")
    public List<BloodRequest> critical() { return requests.findByUrgency(UrgencyLevel.CRITICAL); }

    @PostMapping
    public BloodRequest create(@RequestBody BloodRequest request) {
        request.createdAt = LocalDateTime.now();
        return requests.save(request);
    }

    @PatchMapping("/{id}/fulfill")
    public BloodRequest fulfill(@PathVariable Long id) {
        BloodRequest r = requests.findById(id).orElseThrow();
        r.status = RequestStatus.FULFILLED;
        r.fulfilledAt = LocalDateTime.now();
        return requests.save(r);
    }

    @PatchMapping("/{id}/cancel")
    public BloodRequest cancel(@PathVariable Long id) {
        BloodRequest r = requests.findById(id).orElseThrow();
        r.status = RequestStatus.CANCELLED;
        return requests.save(r);
    }
}
