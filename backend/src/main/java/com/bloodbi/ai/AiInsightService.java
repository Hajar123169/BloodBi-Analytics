package com.bloodbi.ai;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AiInsightService {

    public Map<String, Object> generateInsight(int prediction, double confidence) {
        Map<String, Object> result = new LinkedHashMap<>();

        String risk;
        String recommendation;
        String explanation;

        if (prediction < 15) {
            risk = "LOW";
            explanation = "Predicted demand is below the operational warning threshold.";
            recommendation = "Maintain current stock levels and continue normal monitoring.";
        } else if (prediction < 30) {
            risk = "MEDIUM";
            explanation = "Predicted demand is rising and may pressure normal stock levels.";
            recommendation = "Prepare additional units and monitor emergency requests closely.";
        } else if (prediction < 50) {
            risk = "HIGH";
            explanation = "Predicted demand is high compared with standard stock capacity.";
            recommendation = "Increase blood stock immediately and contact compatible donors.";
        } else {
            risk = "CRITICAL";
            explanation = "Predicted demand is critically high and could create a shortage.";
            recommendation = "Activate emergency donor network and prioritize hospital requests.";
        }

        result.put("prediction", prediction);
        result.put("confidence", Math.max(0.0, Math.min(confidence, 1.0)));
        result.put("riskLevel", risk);
        result.put("explanation", explanation);
        result.put("recommendation", recommendation);
        result.put("generatedAt", LocalDateTime.now().toString());

        return result;
    }
}
