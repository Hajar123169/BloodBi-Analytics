package com.bloodbi.controller;

import com.bloodbi.ai.AiLogService;
import com.bloodbi.ai.PredictionExplanationService;
import com.bloodbi.ai.SHAPExplanationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai/v2")
public class AiLevel2Controller {

    private final SHAPExplanationService shapExplanationService;
    private final PredictionExplanationService predictionExplanationService;
    private final AiLogService logService;

    public AiLevel2Controller(
            SHAPExplanationService shapExplanationService,
            PredictionExplanationService predictionExplanationService,
            AiLogService logService
    ) {
        this.shapExplanationService = shapExplanationService;
        this.predictionExplanationService = predictionExplanationService;
        this.logService = logService;
    }

    @GetMapping("/explain")
    public Map<String, Object> explain(
            @RequestParam(defaultValue = "10") int stock,
            @RequestParam(defaultValue = "25") int demand,
            @RequestParam(defaultValue = "8") int donors
    ) {
        Map<String, Object> response = shapExplanationService.explain(stock, demand, donors);
        logService.log("AI_EXPLAIN", Map.of("stock", stock, "demand", demand, "donors", donors), response);
        return response;
    }

    @GetMapping("/center-explanation")
    public Map<String, Object> centerExplanation(
            @RequestParam(defaultValue = "1") String centerId,
            @RequestParam(defaultValue = "25") int prediction
    ) {
        Map<String, Object> response = predictionExplanationService.explain(centerId, prediction);
        logService.log("AI_CENTER_EXPLANATION", Map.of("centerId", centerId, "prediction", prediction), response);
        return response;
    }
}
