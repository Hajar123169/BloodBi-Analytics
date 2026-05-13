package com.bloodbi.controller;

import com.bloodbi.model.ReportItem;
import com.bloodbi.repository.ReportItemRepository;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportItemRepository reports;
    public ReportController(ReportItemRepository reports) { this.reports = reports; }

    @GetMapping
    public List<ReportItem> all() { return reports.findAll(); }
    @PostMapping
    public ReportItem create(@RequestBody ReportItem report) { return reports.save(report); }
}
