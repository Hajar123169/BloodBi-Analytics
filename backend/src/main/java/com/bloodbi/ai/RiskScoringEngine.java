package com.bloodbi.ai;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class RiskScoringEngine {

    public Map<String, Object> calculateRisk(int stock, int demand) {
        int safeStock = Math.max(stock, 0);
        int safeDemand = Math.max(demand, 0);

        int score;
        if (safeStock == 0 && safeDemand > 0) {
            score = 100;
        } else if (safeDemand == 0) {
            score = 5;
        } else {
            double ratio = (double) safeDemand / Math.max(safeStock, 1);
            score = (int) Math.round(Math.min(100, ratio * 35));
        }

        String level;
        if (score >= 85) level = "CRITICAL";
        else if (score >= 65) level = "HIGH";
        else if (score >= 35) level = "MEDIUM";
        else level = "LOW";

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("stock", safeStock);
        response.put("demand", safeDemand);
        response.put("riskScore", score);
        response.put("riskLevel", level);
        response.put("message", buildMessage(level));
        return response;
    }

    private String buildMessage(String level) {
        return switch (level) {
            case "CRITICAL" -> "Critical shortage risk. Trigger emergency donor outreach.";
            case "HIGH" -> "High shortage risk. Increase stock and monitor requests.";
            case "MEDIUM" -> "Moderate risk. Prepare additional stock if trend continues.";
            default -> "Low risk. Current stock appears stable.";
        };
    }
}
