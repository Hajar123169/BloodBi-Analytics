package com.bloodbi.controller;

import com.bloodbi.ai.AiInsightService;
import com.bloodbi.ai.AiLogService;
import com.bloodbi.ai.AiReportService;
import com.bloodbi.ai.RiskScoringEngine;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiInsightService insightService;
    private final RiskScoringEngine riskScoringEngine;
    private final AiReportService reportService;
    private final AiLogService logService;

    public AiController(
            AiInsightService insightService,
            RiskScoringEngine riskScoringEngine,
            AiReportService reportService,
            AiLogService logService
    ) {
        this.insightService = insightService;
        this.riskScoringEngine = riskScoringEngine;
        this.reportService = reportService;
        this.logService = logService;
    }

    @GetMapping("/insight")
    public Map<String, Object> insight(
            @RequestParam(defaultValue = "25") int prediction,
            @RequestParam(defaultValue = "0.85") double confidence
    ) {
        Map<String, Object> response = insightService.generateInsight(prediction, confidence);
        logService.log("AI_INSIGHT", Map.of("prediction", prediction, "confidence", confidence), response);
        return response;
    }

    @GetMapping("/risk")
    public Map<String, Object> risk(
            @RequestParam(defaultValue = "10") int stock,
            @RequestParam(defaultValue = "20") int demand
    ) {
        Map<String, Object> response = riskScoringEngine.calculateRisk(stock, demand);
        logService.log("AI_RISK", Map.of("stock", stock, "demand", demand), response);
        return response;
    }

    @GetMapping("/report")
    public Map<String, Object> report() {
        Map<String, Object> response = reportService.generateReport();
        logService.log("AI_REPORT", "weekly-report", response);
        return response;
    }

    @GetMapping("/logs")
    public Object logs() {
        return logService.getLogs();
    }
}
