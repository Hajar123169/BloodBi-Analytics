package com.bloodbi.controller;

import com.bloodbi.ai.AiLogService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/chat")
public class AIChatController {

    private final AiLogService logService;

    public AIChatController(AiLogService logService) {
        this.logService = logService;
    }

    @PostMapping
    public Map<String, Object> chat(@RequestBody Map<String, String> body) {
        String message = body.getOrDefault("message", "").toLowerCase();
        String reply;

        if (message.contains("stock") || message.contains("blood")) {
            reply = "Check current stock, predicted demand, and rare blood group thresholds. O_NEG and AB_NEG should be monitored first.";
        } else if (message.contains("emergency") || message.contains("critical")) {
            reply = "Emergency protocol: verify compatible stock, activate donor matching, notify the closest center, and prioritize critical hospital requests.";
        } else if (message.contains("donor")) {
            reply = "Use the donor matcher to find compatible, available, nearby donors. Prioritize donors with recent availability and matching blood type.";
        } else if (message.contains("risk")) {
            reply = "Risk is calculated from demand pressure, available stock, and donor availability. High demand with low stock creates critical risk.";
        } else {
            reply = "I am the BloodBI AI Copilot. Ask me about stock, donor matching, emergency risk, or AI predictions.";
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("response", reply);
        response.put("type", "AI_COPILOT_RESPONSE");
        logService.log("AI_CHAT", body, response);
        return response;
    }
}
