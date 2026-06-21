package com.bloodbi.realtime;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Controller
public class AiRealtimeController {

    @MessageMapping("/ai-alert")
    @SendTo("/topic/alerts")
    public Map<String, Object> sendAlert(Map<String, Object> input) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "AI Emergency Alert Triggered");
        response.put("center", input.getOrDefault("center", "Unknown center"));
        response.put("level", input.getOrDefault("level", "CRITICAL"));
        response.put("action", "Activate emergency donor network immediately");
        response.put("timestamp", LocalDateTime.now().toString());
        return response;
    }
}
