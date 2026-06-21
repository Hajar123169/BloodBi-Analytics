package com.bloodbi.ai;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentLinkedDeque;

@Service
public class AiLogService {

    private final ConcurrentLinkedDeque<Map<String, Object>> logs = new ConcurrentLinkedDeque<>();
    private static final int MAX_LOGS = 100;

    public void log(String eventType, Object input, Object output) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("timestamp", LocalDateTime.now().toString());
        row.put("eventType", eventType);
        row.put("input", input);
        row.put("output", output);
        logs.addFirst(row);

        while (logs.size() > MAX_LOGS) {
            logs.removeLast();
        }
    }

    public List<Map<String, Object>> getLogs() {
        return new ArrayList<>(logs);
    }
}
