package com.bloodbi.ai;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class PredictionExplanationService {

    public Map<String, Object> explain(String centerId, int prediction) {
        Map<String, Object> explanation = new LinkedHashMap<>();

        explanation.put("centerId", centerId);
        explanation.put("trend", prediction > 25 ? "INCREASING" : "STABLE");
        explanation.put("mainFactor", prediction > 25 ? "Recent emergency request volume" : "Normal historical demand pattern");
        explanation.put("confidence", prediction > 25 ? 0.87 : 0.78);
        explanation.put("interpretation", prediction > 25
                ? "The model indicates a possible increase in blood demand for this center."
                : "The model does not detect an immediate demand spike for this center.");

        return explanation;
    }
}
