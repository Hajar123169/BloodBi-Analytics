package com.bloodbi.ai;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiReportService {

    public Map<String, Object> generateReport() {
        Map<String, Object> report = new LinkedHashMap<>();

        report.put("title", "BloodBI AI Weekly Decision Report");
        report.put("generatedDate", LocalDate.now().toString());
        report.put("summary", "AI monitoring indicates priority focus on low-stock rare blood groups and emergency requests.");
        report.put("priorityBloodGroups", List.of("O_NEG", "AB_NEG", "B_NEG"));
        report.put("recommendedActions", List.of(
                "Review critical stock levels every morning.",
                "Contact compatible donors for rare blood groups.",
                "Prepare emergency stock buffers for high-demand centers.",
                "Use donor matching before stock reaches critical threshold."
        ));
        report.put("status", "ACTIVE");

        return report;
    }
}
