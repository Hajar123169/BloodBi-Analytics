package com.bloodbi.ai;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class SHAPExplanationService {

    public Map<String, Object> explain(int stock, int demand, int donors) {
        Map<String, Object> res = new LinkedHashMap<>();

        double stockImpact = round(-0.40 * Math.max(stock, 0));
        double demandImpact = round(0.70 * Math.max(demand, 0));
        double donorImpact = round(-0.20 * Math.max(donors, 0));

        res.put("stockImpact", stockImpact);
        res.put("demandImpact", demandImpact);
        res.put("donorImpact", donorImpact);
        res.put("strongestDriver", strongestDriver(stockImpact, demandImpact, donorImpact));
        res.put("interpretation", "Positive impact increases shortage risk; negative impact reduces shortage risk.");

        return res;
    }

    private String strongestDriver(double stockImpact, double demandImpact, double donorImpact) {
        double a = Math.abs(stockImpact);
        double b = Math.abs(demandImpact);
        double c = Math.abs(donorImpact);
        if (b >= a && b >= c) return "DEMAND";
        if (a >= b && a >= c) return "STOCK";
        return "DONOR_AVAILABILITY";
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
